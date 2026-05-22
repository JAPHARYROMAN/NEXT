# ClickHouse Analytics

Schema migration: `infrastructure/clickhouse/migrations/001_event_analytics.sql`.

## Tables

- `raw_events`
- `playback_events`
- `session_events`
- `creator_events`
- `media_events`
- `recommendation_events`
- `daily_user_activity`
- `daily_creator_activity`
- `video_performance_daily`
- `feed_quality_daily`
- `search_activity_daily`

Every table includes the standard analytics columns: `event_id`, `event_type`, `event_version`, nullable actor/entity IDs, `timestamp`, `ingestion_timestamp`, and `metadata`.

## Storage Strategy

- Raw/category tables use `ReplacingMergeTree(ingestion_timestamp)` for replay-safe idempotency.
- Raw events retain 90 days by TTL.
- Domain category tables retain 180 to 365 days depending on use.
- Daily aggregate tables use `SummingMergeTree` for creator, user, feed, video, and search analytics.

## Query API

`analytics-service` exposes `GET /internal/v1/query/{table}?limit=100` for internal diagnostics and future creator/product analytics clients. The endpoint only allows known table names.
