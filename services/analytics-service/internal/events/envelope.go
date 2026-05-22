package events

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Category string

const (
	Identity       Category = "identity"
	Session        Category = "session"
	Media          Category = "media"
	Playback       Category = "playback"
	Creator        Category = "creator"
	Community      Category = "community"
	Recommendation Category = "recommendation"
	Search         Category = "search"
	Moderation     Category = "moderation"
	Commerce       Category = "commerce"
	System         Category = "system"
)

type Metadata struct {
	Platform      string  `json:"platform"`
	Region        string  `json:"region"`
	IPHash        *string `json:"ip_hash"`
	UserAgentHash *string `json:"user_agent_hash"`
}

type Envelope struct {
	EventID        string         `json:"event_id"`
	EventType      string         `json:"event_type"`
	EventVersion   string         `json:"event_version"`
	EventCategory  Category       `json:"event_category"`
	Producer       string         `json:"producer"`
	Timestamp      string         `json:"timestamp"`
	UserID         *string        `json:"user_id"`
	CreatorID      *string        `json:"creator_id"`
	MediaID        *string        `json:"media_id"`
	SessionID      *string        `json:"session_id"`
	DeviceID       *string        `json:"device_id"`
	RequestID      *string        `json:"request_id"`
	CorrelationID  *string        `json:"correlation_id"`
	IdempotencyKey string         `json:"idempotency_key"`
	Payload        map[string]any `json:"payload"`
	Metadata       Metadata       `json:"metadata"`
}

var allowedTypes = map[Category]map[string]struct{}{
	Identity:       set("user_created", "profile_updated", "user_deleted"),
	Session:        set("session_started", "session_ended", "device_registered"),
	Media:          set("upload_started", "upload_completed", "media_processing_started", "media_processing_completed", "media_published"),
	Playback:       set("playback_started", "playback_paused", "playback_resumed", "playback_completed", "playback_buffered", "playback_seeked", "playback_error"),
	Creator:        set("creator_profile_created", "creator_verified", "creator_content_published"),
	Community:      set("community_created", "community_member_joined"),
	Recommendation: set("feed_requested", "recommendation_served", "recommendation_clicked", "recommendation_skipped"),
	Search:         set("search_performed", "search_result_clicked"),
	Moderation:     set("content_flagged", "moderation_action_taken"),
	Commerce:       set("checkout_started", "purchase_completed"),
	System:         set("service_started", "service_error", "background_job_completed"),
}

func Decode(raw []byte) (Envelope, error) {
	var envelope Envelope
	if err := json.Unmarshal(raw, &envelope); err != nil {
		return Envelope{}, fmt.Errorf("decode event envelope: %w", err)
	}
	if err := envelope.Validate(); err != nil {
		return Envelope{}, err
	}
	return envelope, nil
}

func (e Envelope) Validate() error {
	if _, err := uuid.Parse(e.EventID); err != nil {
		return fmt.Errorf("event_id must be uuid: %w", err)
	}
	if e.EventVersion != "1.0" {
		return errors.New("event_version must be 1.0")
	}
	if _, ok := allowedTypes[e.EventCategory]; !ok {
		return fmt.Errorf("unknown event category %q", e.EventCategory)
	}
	if _, ok := allowedTypes[e.EventCategory][e.EventType]; !ok {
		return fmt.Errorf("unknown event type %q for category %q", e.EventType, e.EventCategory)
	}
	if strings.TrimSpace(e.Producer) == "" {
		return errors.New("producer is required")
	}
	if _, err := time.Parse(time.RFC3339, e.Timestamp); err != nil {
		return fmt.Errorf("timestamp must be RFC3339: %w", err)
	}
	if e.Payload == nil {
		return errors.New("payload is required")
	}
	return nil
}

func (e Envelope) TimestampTime() time.Time {
	t, err := time.Parse(time.RFC3339, e.Timestamp)
	if err != nil {
		return time.Now().UTC()
	}
	return t.UTC()
}

func (e Envelope) Marshal() []byte {
	raw, _ := json.Marshal(e)
	return raw
}

func DLQTopic(category Category) string {
	switch category {
	case Identity:
		return "identity.events.dlq.v1"
	case Media:
		return "media.events.dlq.v1"
	case Playback:
		return "playback.events.dlq.v1"
	default:
		return "analytics.events.dlq.v1"
	}
}

func set(values ...string) map[string]struct{} {
	result := make(map[string]struct{}, len(values))
	for _, value := range values {
		result[value] = struct{}{}
	}
	return result
}
