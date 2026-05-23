// Package eventbus emits auth-service domain events to Kafka.
//
// Producer-side: idempotent, JSON-encoded, with W3C trace context propagated
// via headers so consumer spans link to the producing operation.
package eventbus

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/timestamppb"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
)

// Topics — keep aligned with packages/events/src/topics.ts.
const (
	TopicLifecycleStarted = "auth.lifecycle.started.v1"
	TopicUserRegistered   = "auth.user.registered.v1"
)

// Config configures the producer.
type Config struct {
	Brokers  string // comma-separated host:port
	ClientID string
}

// Producer is a thin, idempotent JSON publisher.
type Producer struct {
	w        *kafka.Writer
	clientID string
}

// New constructs a producer. Caller is responsible for Close.
func New(cfg Config) (*Producer, error) {
	brokers := strings.Split(cfg.Brokers, ",")
	if len(brokers) == 0 || brokers[0] == "" {
		return nil, errors.New("no brokers")
	}
	w := &kafka.Writer{
		Addr:                   kafka.TCP(brokers...),
		AllowAutoTopicCreation: true,
		BatchTimeout:           20 * time.Millisecond,
		RequiredAcks:           kafka.RequireAll,
		Async:                  false,
	}
	return &Producer{w: w, clientID: cfg.ClientID}, nil
}

// Close flushes and closes.
func (p *Producer) Close() error {
	if p == nil || p.w == nil {
		return nil
	}
	return p.w.Close()
}

// envelope is the wire shape for every JSON-encoded event.
type envelope struct {
	EventID   string          `json:"event_id"`
	EmittedAt string          `json:"emitted_at"`
	Type      string          `json:"type"`
	Payload   json.RawMessage `json:"payload"`
}

func (p *Producer) emit(ctx context.Context, topic, key string, body any) error {
	raw, err := json.Marshal(body)
	if err != nil {
		return err
	}
	env := envelope{
		EventID:   uuid.NewString(),
		EmittedAt: time.Now().UTC().Format(time.RFC3339Nano),
		Type:      topic,
		Payload:   raw,
	}
	return p.emitEnvelope(ctx, topic, key, env)
}

func (p *Producer) emitEnvelope(ctx context.Context, topic, key string, env envelope) error {
	if p == nil || p.w == nil {
		return nil
	}

	tracer := otel.Tracer("auth-service/eventbus")
	ctx, span := tracer.Start(ctx, "kafka.produce "+topic,
		trace.WithSpanKind(trace.SpanKindProducer),
		trace.WithAttributes(
			attribute.String("messaging.system", "kafka"),
			attribute.String("messaging.destination.name", topic),
		),
	)
	defer span.End()

	payload, err := json.Marshal(env)
	if err != nil {
		span.RecordError(err)
		return err
	}

	// W3C trace context → Kafka headers. Consumer extracts these so the
	// downstream span has a parent.
	carrier := propagation.MapCarrier{}
	otel.GetTextMapPropagator().Inject(ctx, carrier)
	headers := make([]kafka.Header, 0, len(carrier))
	for k, v := range carrier {
		headers = append(headers, kafka.Header{Key: k, Value: []byte(v)})
	}

	if err := p.w.WriteMessages(ctx, kafka.Message{
		Topic:   topic,
		Key:     []byte(key),
		Value:   payload,
		Headers: headers,
	}); err != nil {
		span.RecordError(err)
		return err
	}
	return nil
}

// --- Concrete events --------------------------------------------------------

// LifecycleStarted is the boot heartbeat (Phase 1 verification event).
type LifecycleStarted struct {
	Service string `json:"service"`
	Version string `json:"version"`
	Env     string `json:"env"`
}

// EmitLifecycleStarted is called once at boot.
func (p *Producer) EmitLifecycleStarted(ctx context.Context, body LifecycleStarted) error {
	return p.emit(ctx, TopicLifecycleStarted, body.Service, body)
}

// UserRegistered is the canonical "a user just signed up" event.
type UserRegistered struct {
	UserID      string `json:"user_id"`
	Handle      string `json:"handle"`
	DisplayName string `json:"display_name"`
	IPCountry   string `json:"ip_country"`
}

// EmitUserRegistered publishes the event with user_id as the partition key
// so consumers can preserve per-user ordering.
func (p *Producer) EmitUserRegistered(ctx context.Context, body UserRegistered) error {
	env, err := userRegisteredEnvelope(time.Now().UTC(), body)
	if err != nil {
		return err
	}
	return p.emitEnvelope(ctx, TopicUserRegistered, body.UserID, env)
}

func userRegisteredEnvelope(now time.Time, body UserRegistered) (envelope, error) {
	event := &authv1.UserRegistered{
		EventId:     uuid.NewString(),
		EmittedAt:   timestamppb.New(now.UTC()),
		UserId:      body.UserID,
		Handle:      body.Handle,
		DisplayName: body.DisplayName,
		IpCountry:   body.IPCountry,
	}
	raw, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(event)
	if err != nil {
		return envelope{}, err
	}
	return envelope{
		EventID:   event.GetEventId(),
		EmittedAt: now.UTC().Format(time.RFC3339Nano),
		Type:      TopicUserRegistered,
		Payload:   raw,
	}, nil
}
