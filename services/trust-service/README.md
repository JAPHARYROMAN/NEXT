# trust-service

Per-account trust score (0..1), verification tracking, anti-bot signals. Event-driven by design per [ADR 0024](../../docs/adr/0024-trust-score-event-driven.md).

Owner: `@next-ecosystem/trust-safety` + `@next-ecosystem/identity`. Status: **scaffolded** — initial constant-score impl in Phase 6, real model in Phase 8.

## Public API (gRPC)

- `TrustService.Get(user_id)` → `TrustState { score, verifications[] }`
- `TrustService.GrantVerification(user_id, kind, evidence)` → staff-only
- `TrustService.RevokeVerification(user_id, kind, reason)` → staff-only
- `TrustService.SignalsFor(user_id, since)` → audit view

## Events

**Emitted**: `trust.score.updated.v1`, `trust.verification.granted.v1`, `trust.verification.revoked.v1`.
**Consumed**: `auth.session.started.v1`, `profile.follow.created.v1`, `media.video.published.v1`, `feed.interaction.v1`, `moderation.case.decided.v1`.

## Data

- `trust_scores`, `verifications`, `penalty_log` in `trust_pg`.
- Historical signal stream replicated to `trust_clickhouse` for analytics.

## Phase 8 model

- Gradient-boosting on engineered features.
- Per-action multiplier (engagement-weighted).
- Decay: missed observations move scores toward 0.5 (neutral) over time.
- Auditable: every score update carries the signal kind that drove it.

## SLO

- `Get P95 < 30 ms` · `Score staleness P99 < 5 min` · `Verification grant audit completeness: 100%`.

[Runbook](../../docs/runbooks/trust-service.md) (TBD).
