// Package lifecycle emits service-lifecycle events to Kafka.
//
// Phase 1: a single, small "I just started" heartbeat that lets us verify the
// end-to-end Kafka path. Phase 3 swaps this for the canonical auth.session.* events
// when login flows ship.
package lifecycle

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/segmentio/kafka-go"
)

// Topic is the lifecycle topic. Not in the canonical event catalog yet — Phase 1 only.
const Topic = "auth.lifecycle.started.v1"

// Config controls the one-shot producer.
type Config struct {
	Brokers  string // comma-separated host:port list
	ClientID string
	Service  string
	Version  string
	Env      string
	EventID  string
}

type payload struct {
	EventID   string `json:"event_id"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	Env       string `json:"env"`
	EmittedAt string `json:"emitted_at"`
}

// EmitStartup publishes one lifecycle event. Caller is responsible for the deadline.
func EmitStartup(ctx context.Context, cfg Config) error {
	brokers := strings.Split(cfg.Brokers, ",")
	w := &kafka.Writer{
		Addr:                   kafka.TCP(brokers...),
		Topic:                  Topic,
		AllowAutoTopicCreation: true,
		BatchTimeout:           20 * time.Millisecond,
		RequiredAcks:           kafka.RequireOne,
	}
	defer func() { _ = w.Close() }()

	body, err := json.Marshal(payload{
		EventID:   cfg.EventID,
		Service:   cfg.Service,
		Version:   cfg.Version,
		Env:       cfg.Env,
		EmittedAt: time.Now().UTC().Format(time.RFC3339Nano),
	})
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	return w.WriteMessages(ctx, kafka.Message{
		Key:   []byte(cfg.Service),
		Value: body,
	})
}
