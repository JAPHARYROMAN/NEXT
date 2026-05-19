# device-graph-service

Tracks the _device → user_ and _device → device_ relationships. Produces a risk score consulted by `session-service` and `trust-service` on sensitive operations.

Owner: `@next-ecosystem/identity`. Status: **scaffolded** — concrete model lands in Phase 8.

## Public API (gRPC)

- `DeviceService.Register(user_id, fingerprint, ua, platform)` → `Device`
- `DeviceService.Score(user_id, device_id, ip_country)` → `risk_score` (0–100)
- `DeviceService.List(user_id)` → trusted devices, for `apps/account-center`
- `DeviceService.Revoke(device_id)` → marks the device as untrusted

## Events

**Emitted**: `device.registered.v1`, `device.trusted.v1`, `device.revoked.v1`, `device.anomaly_detected.v1`.
**Consumed**: `auth.session.started.v1`, `auth.credential.rotated.v1`.

## Data

- `devices`, `device_user_edges`, `device_fingerprints` in `device_graph_pg`.
- Hot fingerprint cache in `device_graph_redis`.
- Time-series of risk events in `analytics_clickhouse` (read by trust-service).

## Anomaly model (Phase 8)

- Statistical baseline per user (geo, UA, time-of-day).
- Lightweight isolation forest on per-device numeric features.
- Outputs `risk_score ∈ [0, 100]`; `≥ 70` triggers `step-up auth` via `notification-auth-service`.

## SLO

- `Score P95 < 50 ms` · `Register P95 < 100 ms` · `Anomaly flag latency P95 < 5 s`.

[Runbook](../../docs/runbooks/device-graph-service.md) (TBD).
