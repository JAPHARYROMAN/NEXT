# media-analytics-service

Playback analytics + QoE aggregation. Consumes raw playback + QoE events, aggregates watch-time, retention curves, and quality metrics, and exposes them to creators and oncall.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `videoAnalytics(video_id, window)` — views, watch-time, retention curve.
- `creatorAnalytics(creator_id, window)` — rollup across a creator's catalog.

## Internal gRPC

- `MediaAnalyticsService.IngestPlaybackEvent(event)` — fan-in from `playback-service`.
- `MediaAnalyticsService.GetVideoStats(video_id, window) → VideoStats`
- `MediaAnalyticsService.GetWatchTime(creator_id, window) → WatchTime`

## Events

**Emitted**: `media.analytics.rollup.v1`.
**Consumed**: `playback.session.started.v1`, `playback.session.ended.v1`, `playback.qoe.sampled.v1`.

Partition key: `video_id`.

## Data

- Raw events streamed to the warehouse; hot rollups in `media_analytics` Postgres.
- Retention curve = per-decile completion histogram.
- QoE SLO dashboards feed `cdn-routing-service` steering weights.

## SLO

- `GetVideoStats P95 < 150 ms` · `Rollup freshness P95 < 60 s`.

[Runbook](../../docs/runbooks/media-analytics-service.md).
