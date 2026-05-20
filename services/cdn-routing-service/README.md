# cdn-routing-service

Multi-CDN steering. Given a viewer (geo, ASN, network class) and a video, it picks the optimal CDN + edge POP and rewrites the playback origin behind the signed URL.

Owner: `@next-ecosystem/media`.

## Internal gRPC

- `CdnRoutingService.Resolve(viewer_geo, asn, video_id) → EdgeTarget`
- `CdnRoutingService.ReportEdgeHealth(pop_id, metrics)` — feeds the steering table.

## Events

**Emitted**: `cdn.steering.decided.v1`.
**Consumed**: `playback.session.started.v1`, `playback.qoe.sampled.v1` (re-steer on degraded QoE).

Partition key: `pop_id`.

## Data

- In-memory steering table, periodically snapshotted to `cdnrouting` Postgres.
- POP health scored from rolling QoE + synthetic probes.

## Strategy

- Score = `f(geo distance, observed throughput, error rate, cost weight)`.
- Sticky per session unless QoE drops below the re-steer threshold.

## SLO

- `Resolve P99 < 10 ms` · `Mis-steer rate P95 < 0.5%`.

[Runbook](../../docs/runbooks/cdn-routing-service.md).
