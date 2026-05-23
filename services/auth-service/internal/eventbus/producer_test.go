package eventbus

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"google.golang.org/protobuf/encoding/protojson"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
)

func TestUserRegisteredEnvelopeUsesProtoPayload(t *testing.T) {
	now := time.Date(2026, 5, 23, 10, 30, 0, 0, time.UTC)
	userID := uuid.NewString()

	env, err := userRegisteredEnvelope(now, UserRegistered{
		UserID:      userID,
		Handle:      "creator",
		DisplayName: "Creator",
		IPCountry:   "KE",
	})
	if err != nil {
		t.Fatalf("userRegisteredEnvelope: %v", err)
	}
	if _, err := uuid.Parse(env.EventID); err != nil {
		t.Fatalf("event_id is not a uuid: %v", err)
	}
	if env.EmittedAt != now.Format(time.RFC3339Nano) {
		t.Fatalf("emitted_at = %q, want %q", env.EmittedAt, now.Format(time.RFC3339Nano))
	}
	if env.Type != TopicUserRegistered {
		t.Fatalf("type = %q, want %q", env.Type, TopicUserRegistered)
	}

	var payload authv1.UserRegistered
	if err := protojson.Unmarshal(env.Payload, &payload); err != nil {
		t.Fatalf("payload did not unmarshal as auth UserRegistered proto: %v", err)
	}
	if payload.GetEventId() != env.EventID {
		t.Fatalf("payload event_id = %q, want envelope event_id %q", payload.GetEventId(), env.EventID)
	}
	if payload.GetUserId() != userID || payload.GetHandle() != "creator" || payload.GetDisplayName() != "Creator" || payload.GetIpCountry() != "KE" {
		t.Fatalf("payload fields = user_id:%q handle:%q display_name:%q ip_country:%q",
			payload.GetUserId(), payload.GetHandle(), payload.GetDisplayName(), payload.GetIpCountry())
	}

	var raw map[string]any
	if err := json.Unmarshal(env.Payload, &raw); err != nil {
		t.Fatalf("payload json: %v", err)
	}
	if _, ok := raw["user_id"]; !ok {
		t.Fatalf("payload uses %v, want proto field names including user_id", raw)
	}
}
