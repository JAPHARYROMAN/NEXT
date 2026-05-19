# session-service

Multi-device session backbone. Owns the session + refresh-token lifecycle, decoupled from credential verification (`auth-service`). Per [ADR 0021](../../docs/adr/0021-session-service-split.md).

Owner: `@next-ecosystem/identity`.

## What this owns

- `sessions` table — one row per logged-in device.
- `refresh_tokens` table — opaque hashes, rotated on use.
- Refresh-token theft detection (a token used twice → entire family revoked).
- Fast-path revocation cache in Redis read by every verifier.
- `session.*` Kafka events.

## Public API (gRPC)

- `SessionService.Create(user_id, method, device_id, ip_country, ua)` → `Session, RefreshToken`
- `SessionService.Validate(session_id)` → `SessionState`
- `SessionService.Refresh(refresh_token)` → new pair, mark old as used
- `SessionService.Revoke(session_id)` → revoke + cache + emit
- `SessionService.List(user_id)` → all active sessions for account-center

## Events

**Emitted**: `session.created.v1`, `session.refreshed.v1`, `session.revoked.v1`, `session.theft_detected.v1`.
**Consumed**: `auth.session.started.v1` (audit + light-touch correlation), `auth.session.ended.v1`.

Partition key: `user_id`.

## Data

- `sessions, refresh_tokens` in `session_pg` (per [ADR 0017](../../docs/adr/0017-database-per-service.md)).
- `session:revoked:<session_id>` keys in `session_redis` with TTL = access-token lifetime.

## SLO

- `Create P95 < 80 ms` · `Validate P95 < 20 ms` · `Revoke propagation P95 < 2 s` · `Availability > 99.95%`.

[Runbook](../../docs/runbooks/session-service.md).
