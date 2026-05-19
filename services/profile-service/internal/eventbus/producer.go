// Package eventbus emits the canonical profile.* topics to Kafka.
//
// Phase 2 uses a thin JSON envelope. Phase 3 will swap to the Protobuf schemas
// already shipped under packages/events/schemas; the topic catalog stays stable.
package eventbus

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"

	"github.com/next-ecosystem/next/services/profile-service/internal/domain"
)

// Topics — keep aligned with packages/events/src/topics.ts.
const (
	TopicProfileCreated   = "profile.user.created.v1"
	TopicProfileUpdated   = "profile.user.updated.v1"
	TopicFollowCreated    = "profile.follow.created.v1"
	TopicFollowDeleted    = "profile.follow.deleted.v1"
)

// Config configures the producer.
type Config struct {
	Brokers  string // comma-separated host:port
	ClientID string
}

// Producer is a thin, idempotent JSON publisher.
type Producer struct {
	w *kafka.Writer
}

// New constructs a producer. Caller is responsible for Close().
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
	return &Producer{w: w}, nil
}

// Close flushes and closes.
func (p *Producer) Close() error {
	if p == nil || p.w == nil {
		return nil
	}
	return p.w.Close()
}

func (p *Producer) emit(ctx context.Context, topic, key string, body any) error {
	if p == nil || p.w == nil {
		return nil
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return err
	}
	return p.w.WriteMessages(ctx, kafka.Message{
		Topic: topic,
		Key:   []byte(key),
		Value: payload,
	})
}

// envelope is the wire shape; mirrors the proto event envelopes (event_id, emitted_at, ...).
type envelope struct {
	EventID   string          `json:"event_id"`
	EmittedAt string          `json:"emitted_at"`
	Type      string          `json:"type"`
	Payload   json.RawMessage `json:"payload"`
}

func envelopeFor(t string, body any) (envelope, error) {
	raw, err := json.Marshal(body)
	if err != nil {
		return envelope{}, err
	}
	return envelope{
		EventID:   uuid.NewString(),
		EmittedAt: time.Now().UTC().Format(time.RFC3339Nano),
		Type:      t,
		Payload:   raw,
	}, nil
}

// ProfileCreated payload mirrors profile.v1.Profile.
type profileCreated struct {
	UserID    string `json:"user_id"`
	Handle    string `json:"handle"`
	Tier      string `json:"tier"`
	CreatedAt string `json:"created_at"`
}

func (p *Producer) EmitProfileCreated(ctx context.Context, prof domain.Profile) error {
	env, err := envelopeFor(TopicProfileCreated, profileCreated{
		UserID:    prof.UserID.String(),
		Handle:    prof.Handle,
		Tier:      string(prof.Tier),
		CreatedAt: prof.CreatedAt.UTC().Format(time.RFC3339Nano),
	})
	if err != nil {
		return err
	}
	return p.emit(ctx, TopicProfileCreated, prof.UserID.String(), env)
}

type profileUpdated struct {
	UserID      string `json:"user_id"`
	Handle      string `json:"handle"`
	DisplayName string `json:"display_name"`
	UpdatedAt   string `json:"updated_at"`
}

func (p *Producer) EmitProfileUpdated(ctx context.Context, prof domain.Profile) error {
	env, err := envelopeFor(TopicProfileUpdated, profileUpdated{
		UserID:      prof.UserID.String(),
		Handle:      prof.Handle,
		DisplayName: prof.DisplayName,
		UpdatedAt:   prof.UpdatedAt.UTC().Format(time.RFC3339Nano),
	})
	if err != nil {
		return err
	}
	return p.emit(ctx, TopicProfileUpdated, prof.UserID.String(), env)
}

type followEdge struct {
	FollowerID string `json:"follower_id"`
	FolloweeID string `json:"followee_id"`
}

func (p *Producer) EmitFollow(ctx context.Context, follower, followee uuid.UUID) error {
	env, err := envelopeFor(TopicFollowCreated, followEdge{
		FollowerID: follower.String(),
		FolloweeID: followee.String(),
	})
	if err != nil {
		return err
	}
	// Partition on followee — keeps "who got followed" events per-aggregate ordered.
	return p.emit(ctx, TopicFollowCreated, followee.String(), env)
}

func (p *Producer) EmitUnfollow(ctx context.Context, follower, followee uuid.UUID) error {
	env, err := envelopeFor(TopicFollowDeleted, followEdge{
		FollowerID: follower.String(),
		FolloweeID: followee.String(),
	})
	if err != nil {
		return err
	}
	return p.emit(ctx, TopicFollowDeleted, followee.String(), env)
}
