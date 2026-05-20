package consumer

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"

	"github.com/next-ecosystem/next/services/analytics-service/internal/clickhouse"
	"github.com/next-ecosystem/next/services/analytics-service/internal/events"
	"github.com/next-ecosystem/next/services/analytics-service/internal/kafka"
	analyticsmetrics "github.com/next-ecosystem/next/services/analytics-service/internal/metrics"
)

type Processor struct {
	writer  clickhouse.Writer
	dlq     kafka.Publisher
	metrics *analyticsmetrics.Metrics
}

func NewProcessor(writer clickhouse.Writer, dlq kafka.Publisher, metrics *analyticsmetrics.Metrics) *Processor {
	return &Processor{writer: writer, dlq: dlq, metrics: metrics}
}

func (p *Processor) Process(ctx context.Context, sourceTopic string, key string, raw []byte) error {
	tracer := otel.Tracer("analytics-service")
	ctx, span := tracer.Start(ctx, "analytics.process")
	defer span.End()

	event, err := events.Decode(raw)
	if err != nil {
		span.RecordError(err)
		return p.publishDLQ(ctx, sourceTopic, "schema_validation", key, raw, events.System, err)
	}

	span.SetAttributes(
		attribute.String("next.event_id", event.EventID),
		attribute.String("next.event_type", event.EventType),
		attribute.String("next.event_category", string(event.EventCategory)),
	)

	ingestionTime := time.Now().UTC()
	rowsByTable := clickhouse.RowsForEvent(event, ingestionTime)
	for table, rows := range rowsByTable {
		if err := p.insertWithRetry(ctx, table, rows); err != nil {
			span.RecordError(err)
			p.metrics.ClickHouseWriteFailures.WithLabelValues(table).Inc()
			return p.publishDLQ(ctx, sourceTopic, "clickhouse_write", key, raw, event.EventCategory, err)
		}
	}

	p.metrics.EventsConsumed.WithLabelValues(sourceTopic, string(event.EventCategory)).Inc()
	p.metrics.IngestionLatency.Observe(float64(ingestionTime.Sub(event.TimestampTime()).Milliseconds()))
	return nil
}

func (p *Processor) insertWithRetry(ctx context.Context, table string, rows []clickhouse.EventRow) error {
	var lastErr error
	for attempt := 0; attempt < 3; attempt++ {
		start := time.Now()
		err := p.writer.InsertEvents(ctx, table, rows)
		p.metrics.ClickHouseInsertLatency.Observe(float64(time.Since(start).Milliseconds()))
		if err == nil {
			return nil
		}
		lastErr = err
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(time.Duration(attempt+1) * 100 * time.Millisecond):
		}
	}
	return fmt.Errorf("insert %s after retries: %w", table, lastErr)
}

func (p *Processor) publishDLQ(ctx context.Context, sourceTopic string, reason string, key string, raw []byte, category events.Category, cause error) error {
	dlqTopic := events.DLQTopic(category)
	err := p.dlq.Publish(ctx, kafka.Message{
		Topic: dlqTopic,
		Key:   key,
		Value: raw,
		Headers: map[string]string{
			"next.source_topic": sourceTopic,
			"next.dlq_reason":   reason,
			"next.error":        cause.Error(),
		},
	})
	if err != nil {
		return fmt.Errorf("publish dlq after %s: %w", reason, err)
	}
	p.metrics.DLQEvents.WithLabelValues(sourceTopic, dlqTopic, reason).Inc()
	slog.Warn("event sent to dlq", "source_topic", sourceTopic, "dlq_topic", dlqTopic, "reason", reason, "err", cause)
	return nil
}
