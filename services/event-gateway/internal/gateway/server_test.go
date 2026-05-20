package gateway

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/next-ecosystem/next/services/event-gateway/internal/kafka"
	gatewaymetrics "github.com/next-ecosystem/next/services/event-gateway/internal/metrics"
	"github.com/next-ecosystem/next/services/event-gateway/internal/ratelimit"
	"github.com/next-ecosystem/next/services/event-gateway/internal/security"
)

type mockPublisher struct {
	messages []kafka.Message
	err      error
}

func (m *mockPublisher) Publish(_ context.Context, msg kafka.Message) error {
	if m.err != nil {
		return m.err
	}
	m.messages = append(m.messages, msg)
	return nil
}

func (m *mockPublisher) Close() error { return nil }

func TestPostEventPublishesValidatedEnvelope(t *testing.T) {
	publisher := &mockPublisher{}
	srv := testServer(t, publisher, ratelimit.New(60, 60))

	res := postJSON(t, srv, "/v1/events", validGatewayEvent("playback-service:test:1"))
	if res.Code != http.StatusAccepted {
		t.Fatalf("status=%d body=%s", res.Code, res.Body.String())
	}
	if len(publisher.messages) != 1 {
		t.Fatalf("expected one published message, got %d", len(publisher.messages))
	}
	msg := publisher.messages[0]
	if msg.Topic != "playback.events.v1" {
		t.Fatalf("topic=%q", msg.Topic)
	}
	if msg.Headers["next.event_type"] != "playback_started" {
		t.Fatalf("headers=%v", msg.Headers)
	}
}

func TestPostEventRejectsMalformedEnvelope(t *testing.T) {
	publisher := &mockPublisher{}
	srv := testServer(t, publisher, ratelimit.New(60, 60))
	body := validGatewayEvent("playback-service:test:bad")
	body["event_id"] = "not-a-uuid"

	res := postJSON(t, srv, "/v1/events", body)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("status=%d body=%s", res.Code, res.Body.String())
	}
	if len(publisher.messages) != 0 {
		t.Fatal("malformed event should not be published")
	}
}

func TestPostEventIsIdempotent(t *testing.T) {
	publisher := &mockPublisher{}
	srv := testServer(t, publisher, ratelimit.New(60, 60))
	body := validGatewayEvent("playback-service:test:dupe")

	first := postJSON(t, srv, "/v1/events", body)
	second := postJSON(t, srv, "/v1/events", body)
	if first.Code != http.StatusAccepted || second.Code != http.StatusAccepted {
		t.Fatalf("statuses=%d,%d", first.Code, second.Code)
	}
	if len(publisher.messages) != 1 {
		t.Fatalf("duplicate idempotency key should publish once, got %d", len(publisher.messages))
	}
}

func TestPostEventRateLimitsProducer(t *testing.T) {
	publisher := &mockPublisher{}
	srv := testServer(t, publisher, ratelimit.New(1, 1))

	first := postJSON(t, srv, "/v1/events", validGatewayEvent("playback-service:test:rl1"))
	second := postJSON(t, srv, "/v1/events", validGatewayEvent("playback-service:test:rl2"))
	if first.Code != http.StatusAccepted {
		t.Fatalf("first status=%d", first.Code)
	}
	if second.Code != http.StatusTooManyRequests {
		t.Fatalf("second status=%d body=%s", second.Code, second.Body.String())
	}
}

func testServer(t *testing.T, publisher *mockPublisher, limiter *ratelimit.Limiter) http.Handler {
	t.Helper()
	auth, err := security.NewAuthenticator("", true)
	if err != nil {
		t.Fatalf("auth: %v", err)
	}
	return New(Config{
		Publisher:     publisher,
		Authenticator: auth,
		Limiter:       limiter,
		Idempotency:   NewMemoryIdempotencyStore(time.Hour),
		Metrics:       gatewaymetrics.New(),
		MaxBodyBytes:  1 << 20,
	}).Routes()
}

func postJSON(t *testing.T, handler http.Handler, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	raw, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec
}

func validGatewayEvent(idempotencyKey string) map[string]any {
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
		"idempotency_key": idempotencyKey,
		"payload": map[string]any{
			"position_ms":        0,
			"rendition":          "1080p",
			"startup_latency_ms": 120,
		},
		"metadata": map[string]any{
			"platform":        "web",
			"region":          "us-east-1",
			"ip_hash":         nil,
			"user_agent_hash": nil,
		},
	}
}
