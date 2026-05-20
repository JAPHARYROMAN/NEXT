package gateway

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"

	"github.com/next-ecosystem/next/services/event-gateway/internal/events"
	"github.com/next-ecosystem/next/services/event-gateway/internal/kafka"
	gatewaymetrics "github.com/next-ecosystem/next/services/event-gateway/internal/metrics"
	"github.com/next-ecosystem/next/services/event-gateway/internal/ratelimit"
	"github.com/next-ecosystem/next/services/event-gateway/internal/security"
)

type IdempotencyStore interface {
	SeenOrStore(key string) bool
}

type Server struct {
	publisher      kafka.Publisher
	authenticator  *security.Authenticator
	limiter        *ratelimit.Limiter
	idempotency    IdempotencyStore
	metrics        *gatewaymetrics.Metrics
	maxBodyBytes   int64
	serviceStarted time.Time
}

type Config struct {
	Publisher     kafka.Publisher
	Authenticator *security.Authenticator
	Limiter       *ratelimit.Limiter
	Idempotency   IdempotencyStore
	Metrics       *gatewaymetrics.Metrics
	MaxBodyBytes  int64
}

type publishResult struct {
	EventID string `json:"event_id"`
	Status  string `json:"status"`
	Reason  string `json:"reason,omitempty"`
}

func New(cfg Config) *Server {
	return &Server{
		publisher:      cfg.Publisher,
		authenticator:  cfg.Authenticator,
		limiter:        cfg.Limiter,
		idempotency:    cfg.Idempotency,
		metrics:        cfg.Metrics,
		maxBodyBytes:   cfg.MaxBodyBytes,
		serviceStarted: time.Now().UTC(),
	}
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer, middleware.Compress(5))
	r.Post("/v1/events", s.handleEvent)
	r.Post("/v1/events/batch", s.handleBatch)
	r.Get("/health", s.handleHealth)
	r.Get("/metrics", func(w http.ResponseWriter, r *http.Request) {
		s.metrics.Handler().ServeHTTP(w, r)
	})
	return r
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":     "ok",
		"service":    "event-gateway",
		"started_at": s.serviceStarted.Format(time.RFC3339),
	})
}

func (s *Server) handleEvent(w http.ResponseWriter, r *http.Request) {
	body, status, err := s.readBody(w, r)
	if err != nil {
		s.reject(w, status, "unknown", "read_body", err)
		return
	}

	envelope, err := events.Decode(body)
	if err != nil {
		s.reject(w, http.StatusBadRequest, "unknown", "schema_validation", err)
		return
	}

	result, status := s.publishOne(r.Context(), r, body, envelope)
	writeJSON(w, status, result)
}

func (s *Server) handleBatch(w http.ResponseWriter, r *http.Request) {
	body, status, err := s.readBody(w, r)
	if err != nil {
		s.reject(w, status, "unknown", "read_body", err)
		return
	}

	var rawEvents []json.RawMessage
	if err := json.Unmarshal(body, &rawEvents); err != nil {
		var wrapper struct {
			Events []json.RawMessage `json:"events"`
		}
		if wrapperErr := json.Unmarshal(body, &wrapper); wrapperErr != nil {
			s.reject(w, http.StatusBadRequest, "unknown", "decode_batch", err)
			return
		}
		rawEvents = wrapper.Events
	}
	if len(rawEvents) == 0 {
		s.reject(w, http.StatusBadRequest, "unknown", "empty_batch", errors.New("batch must include at least one event"))
		return
	}

	results := make([]publishResult, 0, len(rawEvents))
	httpStatus := http.StatusAccepted
	for _, raw := range rawEvents {
		envelope, err := events.Decode(raw)
		if err != nil {
			s.metrics.EventsRejected.WithLabelValues("unknown", "schema_validation").Inc()
			results = append(results, publishResult{Status: "rejected", Reason: err.Error()})
			httpStatus = http.StatusMultiStatus
			continue
		}
		result, resultStatus := s.publishOne(r.Context(), r, body, envelope)
		results = append(results, result)
		if resultStatus >= 400 {
			httpStatus = http.StatusMultiStatus
		}
	}

	writeJSON(w, httpStatus, map[string]any{"results": results})
}

func (s *Server) publishOne(ctx context.Context, r *http.Request, body []byte, envelope events.Envelope) (publishResult, int) {
	tracer := otel.Tracer("event-gateway")
	ctx, span := tracer.Start(ctx, "event-gateway.publish")
	defer span.End()

	span.SetAttributes(
		attribute.String("next.event_id", envelope.EventID),
		attribute.String("next.event_type", envelope.EventType),
		attribute.String("next.event_category", string(envelope.EventCategory)),
		attribute.String("next.producer", envelope.Producer),
	)

	if err := s.authenticator.Authenticate(r, body, envelope.Producer); err != nil {
		s.metrics.EventsRejected.WithLabelValues(string(envelope.EventCategory), "auth").Inc()
		slog.Warn("event rejected", "event_id", envelope.EventID, "producer", envelope.Producer, "reason", "auth", "err", err)
		return publishResult{EventID: envelope.EventID, Status: "rejected", Reason: err.Error()}, http.StatusUnauthorized
	}

	if !s.limiter.Allow(envelope.Producer) {
		s.metrics.EventsRejected.WithLabelValues(string(envelope.EventCategory), "rate_limit").Inc()
		slog.Warn("event rejected", "event_id", envelope.EventID, "producer", envelope.Producer, "reason", "rate_limit")
		return publishResult{EventID: envelope.EventID, Status: "rejected", Reason: "rate limit exceeded"}, http.StatusTooManyRequests
	}

	envelope = envelope.WithRequestMetadata(r)
	if err := envelope.Validate(); err != nil {
		s.metrics.EventsRejected.WithLabelValues(string(envelope.EventCategory), "enrichment_validation").Inc()
		return publishResult{EventID: envelope.EventID, Status: "rejected", Reason: err.Error()}, http.StatusBadRequest
	}
	if s.idempotency.SeenOrStore(envelope.IdempotencyKey) {
		return publishResult{EventID: envelope.EventID, Status: "duplicate"}, http.StatusAccepted
	}

	payload, err := envelope.Marshal()
	if err != nil {
		s.metrics.EventsRejected.WithLabelValues(string(envelope.EventCategory), "marshal").Inc()
		return publishResult{EventID: envelope.EventID, Status: "rejected", Reason: err.Error()}, http.StatusInternalServerError
	}

	start := time.Now()
	err = s.publisher.Publish(ctx, kafka.Message{
		Topic: envelope.Topic(),
		Key:   envelope.PartitionKey(),
		Value: payload,
		Headers: map[string]string{
			"next.event_id":       envelope.EventID,
			"next.event_type":     envelope.EventType,
			"next.event_category": string(envelope.EventCategory),
			"next.producer":       envelope.Producer,
			"next.correlation_id": valueOrEmpty(envelope.CorrelationID),
		},
	})
	s.metrics.KafkaPublishLatency.Observe(float64(time.Since(start).Milliseconds()))
	if err != nil {
		span.RecordError(err)
		s.metrics.EventsRejected.WithLabelValues(string(envelope.EventCategory), "kafka_publish").Inc()
		return publishResult{EventID: envelope.EventID, Status: "rejected", Reason: err.Error()}, http.StatusBadGateway
	}

	s.metrics.EventsReceived.WithLabelValues(string(envelope.EventCategory), envelope.Producer).Inc()
	s.metrics.EventsPublished.WithLabelValues(string(envelope.EventCategory), envelope.Topic()).Inc()
	return publishResult{EventID: envelope.EventID, Status: "accepted"}, http.StatusAccepted
}

func (s *Server) readBody(w http.ResponseWriter, r *http.Request) ([]byte, int, error) {
	defer func() { _ = r.Body.Close() }()
	limited := http.MaxBytesReader(w, r.Body, s.maxBodyBytes)
	body, err := io.ReadAll(limited)
	if err != nil {
		return nil, http.StatusRequestEntityTooLarge, err
	}
	body = bytes.TrimSpace(body)
	if len(body) == 0 {
		return nil, http.StatusBadRequest, errors.New("empty request body")
	}
	return body, http.StatusOK, nil
}

func (s *Server) reject(w http.ResponseWriter, status int, category string, reason string, err error) {
	s.metrics.EventsRejected.WithLabelValues(category, reason).Inc()
	slog.Warn("event request rejected", "category", category, "reason", reason, "err", err)
	writeJSON(w, status, map[string]string{"status": "rejected", "reason": err.Error()})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
