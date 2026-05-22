# analytics-service

Terminal event-stream sink for NEXT analytics. It consumes canonical Kafka category topics, validates event envelopes, transforms events into ClickHouse records, writes raw and domain tables, and sends poison or failed records to DLQ topics.

Owner: `@next-ecosystem/data`.

## Runtime

- Consumes `identity.events.v1`, `session.events.v1`, `media.events.v1`, `playback.events.v1`, `creator.events.v1`, `community.events.v1`, `recommendation.events.v1`, `search.events.v1`, `moderation.events.v1`, `commerce.events.v1`, and `system.events.v1`.
- Writes to `raw_events` plus category tables such as `playback_events`, `session_events`, `creator_events`, `media_events`, and `recommendation_events`.
- Uses idempotent ClickHouse table keys so replay is safe.

## Internal API

- `GET /health`
- `GET /metrics`
- `GET /internal/v1/query/{table}?limit=100`

Allowed query tables are the raw, category, and daily aggregate tables defined in `infrastructure/clickhouse/migrations`.

## DLQ

- Identity failures: `identity.events.dlq.v1`
- Media failures: `media.events.dlq.v1`
- Playback failures: `playback.events.dlq.v1`
- Other analytics failures: `analytics.events.dlq.v1`

## Metrics

- `kafka_consumer_lag`
- `event_ingestion_latency_ms`
- `clickhouse_insert_latency_ms`
- `clickhouse_write_failures_total`
- `dlq_events_total`
- `analytics_events_consumed_total`
