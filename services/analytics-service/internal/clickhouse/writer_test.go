package clickhouse

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTTPWriterInsertsJSONEachRow(t *testing.T) {
	var body string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.Query().Get("query"), "INSERT INTO raw_events FORMAT JSONEachRow") {
			t.Fatalf("query=%q", r.URL.Query().Get("query"))
		}
		buf := new(strings.Builder)
		_, _ = io.Copy(buf, r.Body)
		body = buf.String()
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	writer := NewHTTPWriter(Config{URL: server.URL, Database: "next_analytics", Username: "default"})
	err := writer.InsertEvents(context.Background(), "raw_events", []EventRow{{
		EventID:            "11111111-1111-4111-8111-111111111111",
		EventType:          "service_started",
		EventVersion:       "1.0",
		Timestamp:          "2026-05-20T10:00:00Z",
		IngestionTimestamp: "2026-05-20T10:00:01Z",
		Metadata:           map[string]any{"platform": "service"},
	}})
	if err != nil {
		t.Fatalf("insert: %v", err)
	}
	if !strings.Contains(body, `"event_id":"11111111-1111-4111-8111-111111111111"`) {
		t.Fatalf("body=%s", body)
	}
}
