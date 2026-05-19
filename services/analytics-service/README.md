# analytics-service

Event-stream sink. Subscribes to every `analytics.*` topic, normalizes, batches into ClickHouse. No internal RPC clients — pure consumer + columnar writer.

Owner: `@next-ecosystem/data`.

## Internal gRPC (read-side)
- `AnalyticsService.Query(input) → ResultSet` — read-only, used by `apps/admin`.

## Events
**Consumed**: every topic (subscribes to `analytics.raw.v1` plus a configurable allowlist of domain topics).
**Emitted**: none. Terminal sink.

## Data
- `events` (raw), `videos_hourly`, `creators_daily`, `funnels`, `cohorts` materialized views in `analytics_clickhouse`.
- 90-day retention on raw; aggregates kept forever.

## Strategy
- ClickHouse async inserts (10 k rows / 1 s batches).
- ReplacingMergeTree for idempotent re-ingest from Kafka offset.
- Materialized views compute aggregates at write time.

## SLO
- `Event → queryable P95 < 60 s` · `Query P95 < 2 s` (last-24h aggregates).

[Runbook](../../docs/runbooks/analytics-service.md).
