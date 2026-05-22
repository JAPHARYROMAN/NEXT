package consumer

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/next-ecosystem/next/services/analytics-service/internal/clickhouse"
	"github.com/next-ecosystem/next/services/analytics-service/internal/kafka"
	analyticsmetrics "github.com/next-ecosystem/next/services/analytics-service/internal/metrics"
)

type fakeWriter struct {
	rows map[string][]clickhouse.EventRow
	err  error
}

func (w *fakeWriter) InsertEvents(_ context.Context, table string, rows []clickhouse.EventRow) error {
	if w.err != nil {
		return w.err
	}
	if w.rows == nil {
		w.rows = map[string][]clickhouse.EventRow{}
	}
	w.rows[table] = append(w.rows[table], rows...)
	return nil
}

func (w *fakeWriter) Query(context.Context, string) ([]map[string]any, error) {
	return nil, nil
}

type fakeDLQ struct {
	messages []kafka.Message
}

func (d *fakeDLQ) Publish(_ context.Context, msg kafka.Message) error {
	d.messages = append(d.messages, msg)
	return nil
}

func (d *fakeDLQ) Close() error { return nil }

func TestProcessorWritesRawAndCategoryTables(t *testing.T) {
	writer := &fakeWriter{}
	dlq := &fakeDLQ{}
	processor := NewProcessor(writer, dlq, analyticsmetrics.New())

	if err := processor.Process(context.Background(), "playback.events.v1", "media_1", validAnalyticsEvent(t)); err != nil {
		t.Fatalf("process: %v", err)
	}
	if len(writer.rows["raw_events"]) != 1 {
		t.Fatalf("raw rows=%d", len(writer.rows["raw_events"]))
	}
	if len(writer.rows["playback_events"]) != 1 {
		t.Fatalf("playback rows=%d", len(writer.rows["playback_events"]))
	}
	if len(dlq.messages) != 0 {
		t.Fatalf("unexpected dlq messages=%d", len(dlq.messages))
	}
}

func TestProcessorSendsMalformedPayloadToDLQ(t *testing.T) {
	writer := &fakeWriter{}
	dlq := &fakeDLQ{}
	processor := NewProcessor(writer, dlq, analyticsmetrics.New())

	if err := processor.Process(context.Background(), "playback.events.v1", "bad", []byte(`{"event_id":"bad"}`)); err != nil {
		t.Fatalf("dlq publish should complete without surfacing poison message: %v", err)
	}
	if len(dlq.messages) != 1 {
		t.Fatalf("dlq messages=%d", len(dlq.messages))
	}
	if dlq.messages[0].Topic != "analytics.events.dlq.v1" {
		t.Fatalf("dlq topic=%q", dlq.messages[0].Topic)
	}
}

func TestProcessorSendsClickHouseFailuresToDLQ(t *testing.T) {
	writer := &fakeWriter{err: errors.New("clickhouse unavailable")}
	dlq := &fakeDLQ{}
	processor := NewProcessor(writer, dlq, analyticsmetrics.New())

	if err := processor.Process(context.Background(), "playback.events.v1", "media_1", validAnalyticsEvent(t)); err != nil {
		t.Fatalf("dlq publish should absorb writer failure: %v", err)
	}
	if len(dlq.messages) != 1 {
		t.Fatalf("dlq messages=%d", len(dlq.messages))
	}
	if dlq.messages[0].Topic != "playback.events.dlq.v1" {
		t.Fatalf("dlq topic=%q", dlq.messages[0].Topic)
	}
}

func validAnalyticsEvent(t *testing.T) []byte {
	t.Helper()
	raw, err := json.Marshal(map[string]any{
		"event_id":        "11111111-1111-4111-8111-111111111111",
		"event_type":      "playback_started",
		"event_version":   "1.0",
		"event_category":  "playback",
		"producer":        "playback-service",
		"timestamp":       time.Now().UTC().Format(time.RFC3339),
		"user_id":         "22222222-2222-4222-8222-222222222222",
		"creator_id":      "33333333-3333-4333-8333-333333333333",
		"media_id":        "media_01HZZZZZZZZZZZZZZZZZZZZZZZ",
		"session_id":      "44444444-4444-4444-8444-444444444444",
		"device_id":       "device_01HZZZZZZZZZZZZZZZZZZZZZZZ",
		"request_id":      "req_test",
		"correlation_id":  "corr_test",
		"idempotency_key": "playback-service:test:analytics",
		"payload": map[string]any{
			"position_ms":        0,
			"rendition":          "1080p",
			"startup_latency_ms": 120,
		},
		"metadata": map[string]any{
			"platform":        "web",
			"region":          "us-east-1",
			"ip_hash":         "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"user_agent_hash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
		},
	})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	return raw
}
