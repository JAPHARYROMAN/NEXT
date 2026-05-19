// Package consumer holds profile-service's Kafka consumers.
//
// auth.user.registered.v1 — fired by auth-service when a user signs up.
// We materialize a matching profile here. Idempotent on (user_id) since
// auth-service may retry under at-least-once delivery.
package consumer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"

	"github.com/next-ecosystem/next/services/profile-service/internal/domain"
	"github.com/next-ecosystem/next/services/profile-service/internal/store"
)

const (
	authUserRegisteredTopic = "auth.user.registered.v1"
	consumerGroup           = "profile-service"
)

// envelope mirrors the producer-side envelope in auth-service/internal/eventbus.
type envelope struct {
	EventID   string          `json:"event_id"`
	EmittedAt string          `json:"emitted_at"`
	Type      string          `json:"type"`
	Payload   json.RawMessage `json:"payload"`
}

type userRegisteredPayload struct {
	UserID      string `json:"user_id"`
	Handle      string `json:"handle"`
	DisplayName string `json:"display_name"`
}

// Config configures the consumer.
type Config struct {
	Brokers string // comma-separated host:port
}

// AuthUserRegistered consumer materializes a profile for each new auth user.
type AuthUserRegistered struct {
	reader *kafka.Reader
	store  *store.Postgres
}

// NewAuthUserRegistered constructs the consumer.
func NewAuthUserRegistered(cfg Config, pg *store.Postgres) *AuthUserRegistered {
	brokers := strings.Split(cfg.Brokers, ",")
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        brokers,
		GroupID:        consumerGroup,
		Topic:          authUserRegisteredTopic,
		MinBytes:       1,
		MaxBytes:       10 << 20,
		StartOffset:    kafka.LastOffset, // ignore old events on a fresh group
		CommitInterval: 1 * time.Second,
		MaxWait:        500 * time.Millisecond,
	})
	return &AuthUserRegistered{reader: r, store: pg}
}

// Run loops forever until ctx is cancelled. Returns the first fatal error.
// Per-message errors are logged but don't tear down the loop — the broker
// will redeliver until processing succeeds (or the message ends up in a DLQ
// in Phase 4 when that infrastructure lands).
func (c *AuthUserRegistered) Run(ctx context.Context) error {
	slog.Info("auth.user.registered consumer starting", "topic", authUserRegisteredTopic, "group", consumerGroup)
	defer func() { _ = c.reader.Close() }()

	for {
		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				return nil
			}
			slog.WarnContext(ctx, "fetch failed", "err", err)
			time.Sleep(500 * time.Millisecond)
			continue
		}

		// Extract trace context from headers so the consumer span links to
		// auth-service's producer span. End-to-end tracing through Kafka.
		carrier := propagation.MapCarrier{}
		for _, h := range msg.Headers {
			carrier[h.Key] = string(h.Value)
		}
		msgCtx := otel.GetTextMapPropagator().Extract(ctx, carrier)

		tracer := otel.Tracer("profile-service/consumer")
		msgCtx, span := tracer.Start(msgCtx, "kafka.consume "+authUserRegisteredTopic,
			trace.WithSpanKind(trace.SpanKindConsumer),
			trace.WithAttributes(
				attribute.String("messaging.system", "kafka"),
				attribute.String("messaging.source.name", authUserRegisteredTopic),
				attribute.Int64("messaging.kafka.message.offset", msg.Offset),
				attribute.String("messaging.kafka.message.key", string(msg.Key)),
			),
		)

		if err := c.handle(msgCtx, msg); err != nil {
			slog.ErrorContext(msgCtx, "handle failed",
				"err", err, "offset", msg.Offset, "key", string(msg.Key))
			span.RecordError(err)
			span.End()
			// Don't commit — broker will redeliver.
			continue
		}

		if err := c.reader.CommitMessages(msgCtx, msg); err != nil {
			slog.ErrorContext(msgCtx, "commit failed", "err", err, "offset", msg.Offset)
		}
		span.End()
	}
}

func (c *AuthUserRegistered) handle(ctx context.Context, msg kafka.Message) error {
	var env envelope
	if err := json.Unmarshal(msg.Value, &env); err != nil {
		return fmt.Errorf("unmarshal envelope: %w", err)
	}
	var p userRegisteredPayload
	if err := json.Unmarshal(env.Payload, &p); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	userID, err := uuid.Parse(p.UserID)
	if err != nil {
		// Malformed event; not retryable. Log and drop.
		slog.WarnContext(ctx, "bad user_id; dropping", "user_id", p.UserID)
		return nil
	}
	handle, err := domain.NormalizeHandle(p.Handle)
	if err != nil {
		slog.WarnContext(ctx, "bad handle; dropping", "handle", p.Handle, "err", err)
		return nil
	}

	prof := domain.Profile{
		UserID:      userID,
		Handle:      handle,
		DisplayName: p.DisplayName,
		Tier:        domain.TierAuthenticated,
	}
	created, err := c.store.CreateProfile(ctx, prof)
	if err != nil {
		// Idempotency: if the profile already exists for this user (or handle),
		// treat the event as already processed. Auth-service is allowed to retry.
		if errors.Is(err, store.ErrHandleTaken) {
			slog.InfoContext(ctx, "profile already exists; skipping", "user_id", userID)
			return nil
		}
		if strings.Contains(err.Error(), "profile already exists for user") {
			slog.InfoContext(ctx, "profile already exists; skipping", "user_id", userID)
			return nil
		}
		return fmt.Errorf("create profile: %w", err)
	}

	slog.InfoContext(ctx, "profile materialized from auth event",
		"user_id", created.UserID, "handle", created.Handle)
	return nil
}
