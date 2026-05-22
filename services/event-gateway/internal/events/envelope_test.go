package events

import (
	"encoding/json"
	"testing"
)

func TestDecodeRejectsPrivateFields(t *testing.T) {
	body := validEventBody(t)
	payload := body["payload"].(map[string]any)
	payload["ip_address"] = "203.0.113.10"
	raw, _ := json.Marshal(body)

	_, err := Decode(raw)
	if err == nil {
		t.Fatal("expected privacy validation error")
	}
}

func TestDecodeRejectsWrongCategory(t *testing.T) {
	body := validEventBody(t)
	body["event_category"] = "media"
	raw, _ := json.Marshal(body)

	_, err := Decode(raw)
	if err == nil {
		t.Fatal("expected category validation error")
	}
}

func TestDecodeRejectsMalformedPayloadShape(t *testing.T) {
	body := validEventBody(t)
	body["payload"] = map[string]any{"rendition": "1080p"}
	raw, _ := json.Marshal(body)

	_, err := Decode(raw)
	if err == nil {
		t.Fatal("expected payload shape validation error")
	}
}

func TestEnvelopeRouting(t *testing.T) {
	raw, _ := json.Marshal(validEventBody(t))
	envelope, err := Decode(raw)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if envelope.Topic() != "playback.events.v1" {
		t.Fatalf("unexpected topic %q", envelope.Topic())
	}
	if envelope.PartitionKey() != "media_01HZZZZZZZZZZZZZZZZZZZZZZZ" {
		t.Fatalf("unexpected key %q", envelope.PartitionKey())
	}
}

func validEventBody(t *testing.T) map[string]any {
	t.Helper()
	return map[string]any{
		"event_id":        "11111111-1111-4111-8111-111111111111",
		"event_type":      "playback_started",
		"event_version":   "1.0",
		"event_category":  "playback",
		"producer":        "playback-service",
		"timestamp":       "2026-05-20T10:00:00Z",
		"user_id":         "22222222-2222-4222-8222-222222222222",
		"creator_id":      "33333333-3333-4333-8333-333333333333",
		"media_id":        "media_01HZZZZZZZZZZZZZZZZZZZZZZZ",
		"session_id":      "44444444-4444-4444-8444-444444444444",
		"device_id":       "device_01HZZZZZZZZZZZZZZZZZZZZZZZ",
		"request_id":      "req_test",
		"correlation_id":  "corr_test",
		"idempotency_key": "playback-service:test:1",
		"payload": map[string]any{
			"position_ms":        float64(0),
			"rendition":          "1080p",
			"startup_latency_ms": float64(120),
		},
		"metadata": map[string]any{
			"platform":        "web",
			"region":          "us-east-1",
			"ip_hash":         "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"user_agent_hash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
		},
	}
}
