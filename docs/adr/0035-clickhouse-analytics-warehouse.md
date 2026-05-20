# 0035. ClickHouse as the analytics warehouse

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture · Backend · Infrastructure
- **Tags**: analytics, data, events

## Context

NEXT emits a high volume of events — playback, recommendation impressions, feed
interactions, search, trust signals. These feed analytics: creator dashboards,
recommendation telemetry, feed-diversity and creator-fairness metrics, QoE
rollups. This is a large analytical workload — wide scans, aggregations, time
windows — and it is fundamentally different from the transactional access the
per-service Postgres databases ([ADR 0017](0017-database-per-service.md)) are
sized for. Running it on those databases would degrade the services that own
them. The analytics path needs its own store, and that decision was being
implemented (event-bus + analytics pipeline) without an ADR to anchor it.

## Decision

**ClickHouse is the analytics warehouse for NEXT.** Event-derived analytical
data flows into ClickHouse; it is the query target for dashboards, telemetry,
and the recommendation guardrail metrics. Transactional service databases are
never used for large analytical workloads.

## Rationale

ClickHouse is a column-store purpose-built for exactly this shape of work:
billions of append-only event rows, wide aggregations, and time-bucketed
queries, at interactive latency. Separating the analytical store from the
transactional stores means a heavy dashboard query cannot starve a production
service — the isolation that [ADR 0017](0017-database-per-service.md) protects
at the service level, extended to the analytics tier.

## Alternatives considered

- **Query the per-service Postgres databases directly** — no new system, but
  analytical scans contend with transactional traffic and break ADR 0017's
  isolation. Rejected.
- **A row-store warehouse (Postgres / a managed RDBMS as warehouse)** — works at
  small scale; column scans over billions of event rows are far slower and
  costlier than a column store. Rejected.
- **A cloud-proprietary warehouse (Redshift / BigQuery / Snowflake)** — capable,
  but adds vendor lock-in and cost; ClickHouse is self-hostable and already in
  the stack. Rejected for v1; revisitable at extreme scale.

## Consequences

### Positive

- Analytical load is fully isolated from transactional services.
- Column storage gives interactive aggregations over very large event volumes.
- Self-hosted — no analytics-warehouse vendor lock-in.

### Negative

- Another stateful system to operate, back up, and monitor.
- ClickHouse is eventually consistent for ingestion; dashboards are near-real-time,
  not transactionally exact. Acceptable for analytics.

### Neutral / open questions

- Ingestion path (direct event-stream consumer vs. batch loader) is an
  implementation detail owned by the analytics service, not this ADR.

## Implementation rules

- Event-derived analytical data lands in ClickHouse, not in any service's
  transactional database.
- No service runs large analytical scans or aggregations against a per-service
  Postgres database.
- Analytics tables are derived and rebuildable by replaying events — ClickHouse
  is not a system of record.
- Recommendation guardrail metrics (exploration share, creator Gini, topic
  entropy) are computed in ClickHouse (see [ADR 0031](0031-anti-homogenization.md)).

## Agent instructions

- **Claude** — Keep this ADR consistent with [ADR 0017](0017-database-per-service.md)
  and the event architecture. Flag any service that queries a transactional DB
  for analytics.
- **Codex** — Route event-derived analytics to ClickHouse. Do not add analytical
  query paths to service Postgres databases. Own the ClickHouse schema and
  ingestion under `/infrastructure` and the analytics service.
- **Composer** — Creator-facing analytics surfaces read analytics via the
  GraphQL gateway, never ClickHouse directly.
- **Copilot** — Do not scaffold analytics queries against transactional
  databases.

## Review triggers

- ClickHouse operational cost or load becomes a concern at scale.
- A requirement appears for transactionally-exact analytics (ClickHouse cannot
  provide it).
- A managed warehouse becomes clearly cheaper than self-hosting.

## Related documents

- [0017. Database per service; no shared schemas](0017-database-per-service.md)
- [0008. Event bus: Kafka via MSK](0008-event-bus.md)
- [0031. Anti-homogenization & creator fairness](0031-anti-homogenization.md)
