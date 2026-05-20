package clickhouse

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/next-ecosystem/next/services/analytics-service/internal/events"
)

type Config struct {
	URL      string
	Database string
	Username string
	Password string
}

type EventRow struct {
	EventID            string         `json:"event_id"`
	EventType          string         `json:"event_type"`
	EventVersion       string         `json:"event_version"`
	EventCategory      string         `json:"event_category,omitempty"`
	Producer           string         `json:"producer,omitempty"`
	UserID             *string        `json:"user_id"`
	CreatorID          *string        `json:"creator_id"`
	MediaID            *string        `json:"media_id"`
	SessionID          *string        `json:"session_id"`
	DeviceID           *string        `json:"device_id"`
	Timestamp          string         `json:"timestamp"`
	IngestionTimestamp string         `json:"ingestion_timestamp"`
	Payload            map[string]any `json:"payload,omitempty"`
	Metadata           map[string]any `json:"metadata"`
}

type Writer interface {
	InsertEvents(context.Context, string, []EventRow) error
	Query(context.Context, string) ([]map[string]any, error)
}

type HTTPWriter struct {
	client *http.Client
	cfg    Config
}

func NewHTTPWriter(cfg Config) *HTTPWriter {
	return &HTTPWriter{
		client: &http.Client{Timeout: 10 * time.Second},
		cfg:    cfg,
	}
}

func (w *HTTPWriter) InsertEvents(ctx context.Context, table string, rows []EventRow) error {
	if len(rows) == 0 {
		return nil
	}

	var body bytes.Buffer
	for _, row := range rows {
		raw, err := json.Marshal(row)
		if err != nil {
			return fmt.Errorf("marshal row: %w", err)
		}
		body.Write(raw)
		body.WriteByte('\n')
	}

	query := fmt.Sprintf("INSERT INTO %s FORMAT JSONEachRow", table)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.queryURL(query), &body)
	if err != nil {
		return err
	}
	w.decorate(req)

	res, err := w.client.Do(req)
	if err != nil {
		return fmt.Errorf("clickhouse insert %s: %w", table, err)
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode < 200 || res.StatusCode > 299 {
		return fmt.Errorf("clickhouse insert %s returned %s", table, res.Status)
	}
	return nil
}

func (w *HTTPWriter) Query(ctx context.Context, query string) ([]map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.queryURL(query+" FORMAT JSONEachRow"), nil)
	if err != nil {
		return nil, err
	}
	w.decorate(req)
	res, err := w.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode < 200 || res.StatusCode > 299 {
		return nil, fmt.Errorf("clickhouse query returned %s", res.Status)
	}
	decoder := json.NewDecoder(res.Body)
	rows := []map[string]any{}
	for {
		row := map[string]any{}
		if err := decoder.Decode(&row); err != nil {
			if err == io.EOF {
				break
			}
			return nil, err
		}
		rows = append(rows, row)
	}
	return rows, nil
}

func (w *HTTPWriter) queryURL(query string) string {
	base := strings.TrimRight(w.cfg.URL, "/")
	values := url.Values{}
	values.Set("database", w.cfg.Database)
	values.Set("query", query)
	return base + "/?" + values.Encode()
}

func (w *HTTPWriter) decorate(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	if w.cfg.Username != "" || w.cfg.Password != "" {
		req.SetBasicAuth(w.cfg.Username, w.cfg.Password)
	}
}

func RowsForEvent(event events.Envelope, ingestionTime time.Time) map[string][]EventRow {
	row := EventRow{
		EventID:            event.EventID,
		EventType:          event.EventType,
		EventVersion:       event.EventVersion,
		EventCategory:      string(event.EventCategory),
		Producer:           event.Producer,
		UserID:             event.UserID,
		CreatorID:          event.CreatorID,
		MediaID:            event.MediaID,
		SessionID:          event.SessionID,
		DeviceID:           event.DeviceID,
		Timestamp:          event.TimestampTime().Format(time.RFC3339Nano),
		IngestionTimestamp: ingestionTime.UTC().Format(time.RFC3339Nano),
		Payload:            event.Payload,
		Metadata: map[string]any{
			"platform":        event.Metadata.Platform,
			"region":          event.Metadata.Region,
			"ip_hash":         event.Metadata.IPHash,
			"user_agent_hash": event.Metadata.UserAgentHash,
			"producer":        event.Producer,
		},
	}

	rows := map[string][]EventRow{"raw_events": []EventRow{row}}
	switch event.EventCategory {
	case events.Playback:
		rows["playback_events"] = []EventRow{row}
	case events.Session:
		rows["session_events"] = []EventRow{row}
	case events.Creator:
		rows["creator_events"] = []EventRow{row}
	case events.Media:
		rows["media_events"] = []EventRow{row}
	case events.Recommendation:
		rows["recommendation_events"] = []EventRow{row}
	}
	return rows
}
