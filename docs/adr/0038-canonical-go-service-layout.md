# 0038. Canonical Go service layout

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture · Backend
- **Tags**: services, governance, conventions

## Context

The Phase 10 audit ([runtime-boundary-audit.md](../audits/runtime-boundary-audit.md)
RB-4, debt TD-09) found **two divergent `internal/` layouts** among the deep Go
services:

- Phase 6–8 services use `internal/{api,domain,store}`.
- The Phase 5 services (`analytics-service`, `event-gateway`) use
  `internal/{api,consumer,kafka,config,events,metrics,…}`.

Neither matches the other, and neither matches the layout named in the Phase 10
prompt. With 20 scaffolds still to be built, an unratified layout guarantees the
divergence widens. A service's structure should be predictable from its name.

## Decision

Every Go service under `/services` uses this layout:

```
services/<name>/
  cmd/server/main.go        — entrypoint: config, telemetry, wiring, shutdown
  internal/
    api/                    — gRPC + HTTP handlers (the transport adapter)
    domain/                 — business logic; pure, no I/O, unit-tested
    store/                  — datastore adapters (Postgres, Redis, …)
    eventbus/               — Kafka producers          (only if it emits events)
    consumer/               — Kafka consumers          (only if it consumes)
  proto/<domain>/v<N>/<domain>.proto
  migrations/NNN_*.up.sql + NNN_*.down.sql   (only if it owns a database)
  go.mod
  README.md
```

`api`, `domain`, `store` are **mandatory** for a functional service. `eventbus`
and `consumer` appear **only** when the service actually produces or consumes
events. `migrations/` exists only for services that own a database.

The Phase 5 layout maps onto this: `kafka` → `eventbus` + `consumer`; `config`
→ a small `config.go` in `cmd/server` or `internal`; `metrics` → the shared
`telemetry` package; `events` → typed payloads in `domain`.

Compute services additionally carry a `worker/` (or named) perf-worker directory
per [ADR 0037](0037-compute-coordinator-worker-split.md).

## Rationale

One layout means any contributor — human or agent — can navigate any service
without relearning it, and reviewers can spot a structural problem at a glance.
The `domain` / `store` / `api` split enforces the dependency direction that
keeps business logic pure and testable (`domain` imports nothing I/O; `api` and
`store` are adapters). Making `eventbus`/`consumer` optional-but-named avoids
empty directories while keeping event-handling code in a predictable place.

## Alternatives considered

- **Bless both existing layouts** — no migration cost, but the divergence is
  exactly the drift this ADR exists to stop, and it scales to the 20 scaffolds.
  Rejected.
- **The Phase 5 layout as canonical** (`kafka`, `config`, `metrics`, `events`) —
  more directories, splits concerns the shared `telemetry` package already
  owns (`metrics`). Rejected as heavier than needed.
- **A flat `internal/` with no sub-packages** — too loose; loses the
  domain/adapter dependency discipline. Rejected.

## Consequences

### Positive

- Every service is structurally predictable; review and navigation are uniform.
- `_template` can encode the layout so new services start conformant.
- The domain/adapter split keeps business logic pure and unit-testable.

### Negative

- Existing services must realign — but lazily, not in a big-bang refactor.

### Neutral / open questions

- A service with no datastore and no events legitimately has only
  `api` + `domain`; that is conformant, not a violation.

## Implementation rules

- New services follow the layout exactly; `_template` is updated to match.
- `domain/` must not import `store/`, `api/`, or any I/O package — it is pure.
- `eventbus/` and `consumer/` exist only when the service emits/consumes events.
- `migrations/` exists only for services owning a database; pairs of
  `NNN_*.up.sql` + `NNN_*.down.sql`.
- Existing services realign to this layout the next time they are substantively
  edited — not as a standalone refactor.

## Agent instructions

- **Claude** — Update `services/_template` to this layout. Reject new services
  that deviate. Treat realignment as lazy, not blocking.
- **Codex** — Build all new and scaffold services to this layout. Realign a
  service's structure when next substantively editing it.
- **Composer** — No action; frontend is unaffected.
- **Copilot** — Scaffold service files only into these directories.

## Review triggers

- A service category appears that genuinely does not fit (e.g. a pure batch job
  with no `api`).
- The shared `telemetry` package stops covering what `metrics` needs.

## Related documents

- [0007. Backend languages: Go primary, Rust perf-critical](0007-backend-languages.md)
- [0037. Compute coordinator + worker split](0037-compute-coordinator-worker-split.md)
- [Runtime boundary audit](../audits/runtime-boundary-audit.md) — RB-4
