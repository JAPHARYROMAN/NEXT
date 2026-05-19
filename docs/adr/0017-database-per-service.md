# 0017. Database per service; no shared schemas

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/architecture @next-ecosystem/data
- **Tags**: data, architecture

## Context

A platform with this many services and this much velocity cannot tolerate cross-service database coupling. Schema changes that ripple across services freeze the platform. Cross-service joins create implicit shared ownership.

## Decision

**Every service owns its database. No other service reads from it directly.** Cross-service data exchange happens via events or RPC, never via the database.

## Alternatives considered

- **Shared schemas with per-service ownership of tables** — sounds clean; in practice tables grow joins to other services' tables and lock-in compounds.
- **Federated database (e.g. CockroachDB shared cluster)** — same coupling problem with different operational scars.

## Consequences

### Positive
- Each service can choose the right store and the right schema-evolution cadence.
- Failure isolation: an OLTP outage in one service doesn't take another down.
- Backups, replication, and capacity planning scoped per service.

### Negative
- Cross-service queries require event-driven materialized views (we ship a search-side projection, a feed-side projection, etc.).
- Reporting requires the analytics pipeline (Kafka → ClickHouse) rather than a single SQL endpoint. This is by design.

## Implementation notes

- Each service's database lives in its own RDS instance / Redis cluster / ClickHouse shard, with per-service IAM and Vault paths.
- Cross-service queries are explicitly forbidden in CI: a static check fails any service connecting to a `next-<other-service>-*` database URL.
- Search and analytics consume events to maintain their indexed projections.
