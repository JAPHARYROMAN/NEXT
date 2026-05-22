package events

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

const Version = "1.0"

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

var (
	ErrUnknownCategory = errors.New("unknown event category")
	ErrUnknownType     = errors.New("unknown event type")
)

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

var topicByCategory = map[Category]string{
	Identity:       "identity.events.v1",
	Session:        "session.events.v1",
	Media:          "media.events.v1",
	Playback:       "playback.events.v1",
	Creator:        "creator.events.v1",
	Community:      "community.events.v1",
	Recommendation: "recommendation.events.v1",
	Search:         "search.events.v1",
	Moderation:     "moderation.events.v1",
	Commerce:       "commerce.events.v1",
	System:         "system.events.v1",
}

func Decode(raw []byte) (Envelope, error) {
	dec := json.NewDecoder(strings.NewReader(string(raw)))
	dec.DisallowUnknownFields()
	var envelope Envelope
	if err := dec.Decode(&envelope); err != nil {
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
	if e.EventVersion != Version {
		return fmt.Errorf("event_version must be %s", Version)
	}
	if _, ok := allowedTypes[e.EventCategory]; !ok {
		return ErrUnknownCategory
	}
	if _, ok := allowedTypes[e.EventCategory][e.EventType]; !ok {
		return fmt.Errorf("%w %q for category %q", ErrUnknownType, e.EventType, e.EventCategory)
	}
	if strings.TrimSpace(e.Producer) == "" {
		return errors.New("producer is required")
	}
	if _, err := time.Parse(time.RFC3339, e.Timestamp); err != nil {
		return fmt.Errorf("timestamp must be ISO-8601/RFC3339: %w", err)
	}
	for field, value := range map[string]*string{
		"user_id":    e.UserID,
		"creator_id": e.CreatorID,
		"session_id": e.SessionID,
	} {
		if value != nil {
			if _, err := uuid.Parse(*value); err != nil {
				return fmt.Errorf("%s must be uuid when present: %w", field, err)
			}
		}
	}
	if strings.TrimSpace(e.IdempotencyKey) == "" {
		return errors.New("idempotency_key is required")
	}
	if e.Metadata.Platform != "web" && e.Metadata.Platform != "mobile" && e.Metadata.Platform != "tv" && e.Metadata.Platform != "service" {
		return errors.New("metadata.platform must be web, mobile, tv, or service")
	}
	if strings.TrimSpace(e.Metadata.Region) == "" {
		return errors.New("metadata.region is required")
	}
	if e.Payload == nil {
		return errors.New("payload is required")
	}
	if err := validatePayloadShape(e.EventType, e.Payload); err != nil {
		return err
	}
	if err := rejectPrivateFields(e.Payload, "payload"); err != nil {
		return err
	}
	return nil
}

func (e Envelope) Topic() string {
	return topicByCategory[e.EventCategory]
}

func (e Envelope) PartitionKey() string {
	for _, value := range []*string{e.MediaID, e.CreatorID, e.UserID, e.SessionID, e.DeviceID, e.CorrelationID} {
		if value != nil && *value != "" {
			return *value
		}
	}
	return e.EventID
}

func (e Envelope) WithRequestMetadata(r *http.Request) Envelope {
	region := r.Header.Get("X-NEXT-Region")
	if e.Metadata.Region == "" && region != "" {
		e.Metadata.Region = region
	}
	if e.Metadata.IPHash == nil {
		hash := hashRemoteIP(r.RemoteAddr)
		e.Metadata.IPHash = &hash
	}
	if e.Metadata.UserAgentHash == nil {
		hash := hashString(r.UserAgent())
		e.Metadata.UserAgentHash = &hash
	}
	return e
}

func (e Envelope) Marshal() ([]byte, error) {
	return json.Marshal(e)
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

func rejectPrivateFields(value any, path string) error {
	switch typed := value.(type) {
	case map[string]any:
		for key, child := range typed {
			lower := strings.ToLower(key)
			switch lower {
			case "ip", "ip_address", "raw_ip", "precise_location", "latitude", "longitude", "password", "token", "access_token", "refresh_token", "private_message", "payment_secret", "full_user_agent", "user_agent":
				return fmt.Errorf("privacy violation: raw private field %s.%s is not allowed", path, key)
			}
			if err := rejectPrivateFields(child, path+"."+key); err != nil {
				return err
			}
		}
	case []any:
		for i, child := range typed {
			if err := rejectPrivateFields(child, fmt.Sprintf("%s[%d]", path, i)); err != nil {
				return err
			}
		}
	}
	return nil
}

var requiredPayloadFields = map[string][]string{
	"user_created":               {"consent_analytics"},
	"profile_updated":            {"changed_fields", "profile_version"},
	"user_deleted":               {"deletion_reason", "anonymized"},
	"session_started":            {"auth_method"},
	"session_ended":              {"duration_ms", "end_reason"},
	"device_registered":          {"device_family", "os_family"},
	"upload_started":             {"upload_id", "file_size_bytes", "mime_type"},
	"upload_completed":           {"upload_id", "file_size_bytes", "duration_ms", "checksum_sha256"},
	"media_processing_started":   {"pipeline_id", "pipeline_version"},
	"media_processing_completed": {"pipeline_id", "duration_ms", "renditions"},
	"media_published":            {"visibility"},
	"playback_started":           {"position_ms"},
	"playback_paused":            {"position_ms"},
	"playback_resumed":           {"position_ms"},
	"playback_completed":         {"duration_ms", "watch_time_ms", "completion_ratio"},
	"playback_buffered":          {"position_ms", "buffer_duration_ms"},
	"playback_seeked":            {"from_ms", "to_ms"},
	"playback_error":             {"error_code", "fatal"},
	"creator_profile_created":    {"creator_handle"},
	"creator_verified":           {"verification_level", "verified_by"},
	"creator_content_published":  {"content_type", "visibility"},
	"community_created":          {"community_id", "visibility"},
	"community_member_joined":    {"community_id"},
	"feed_requested":             {"surface", "request_reason", "limit"},
	"recommendation_served":      {"surface", "algorithm", "candidate_count", "served_media_ids"},
	"recommendation_clicked":     {"surface", "rank", "algorithm"},
	"recommendation_skipped":     {"surface", "rank", "dwell_ms"},
	"search_performed":           {"query_hash", "query_length", "result_count"},
	"search_result_clicked":      {"query_hash", "result_rank", "result_type"},
	"content_flagged":            {"content_type", "reason_code", "source"},
	"moderation_action_taken":    {"action", "reason_code", "policy_version"},
	"checkout_started":           {"checkout_id", "currency", "amount_minor"},
	"purchase_completed":         {"checkout_id", "currency", "amount_minor", "payment_reference_hash"},
	"service_started":            {"service_name", "service_version", "environment"},
	"service_error":              {"service_name", "error_code", "severity", "retryable"},
	"background_job_completed":   {"job_name", "duration_ms", "status"},
}

func validatePayloadShape(eventType string, payload map[string]any) error {
	for _, field := range requiredPayloadFields[eventType] {
		if _, ok := payload[field]; !ok {
			return fmt.Errorf("payload.%s is required for %s", field, eventType)
		}
	}
	for _, field := range []string{"position_ms", "duration_ms", "watch_time_ms", "buffer_duration_ms", "from_ms", "to_ms", "rank", "dwell_ms", "candidate_count", "limit", "result_count", "query_length", "file_size_bytes", "amount_minor"} {
		if value, ok := payload[field]; ok {
			number, ok := value.(float64)
			if !ok || number < 0 {
				return fmt.Errorf("payload.%s must be a non-negative number", field)
			}
		}
	}
	return nil
}

func hashRemoteIP(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = remoteAddr
	}
	return hashString(host)
}

func hashString(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}
