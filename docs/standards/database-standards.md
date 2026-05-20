# Database Standards

> The enforceable standard for every datastore NEXT uses. Grounded in
> [ADR 0017](../adr/0017-database-per-service.md) (database per service),
> [ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md) (ClickHouse),
> [ADR 0005](../adr/0005-vector-database.md) (Qdrant).

Status: **binding**.

## 0. The isolation rule

Each service owns its own database; **no service reads or writes another
service's tables** ([ADR 0017](../adr/0017-database-per-service.md)). Data is
shared via APIs and events, never by shared schema. This is the rule the rest of
this document operates within.

## 1. PostgreSQL — transactional stores

### Migrations

- File names: `migrations/NNN_<slug>.up.sql` + `NNN_<slug>.down.sql` — paired,
  sequential, zero-padded.
- Every `up` has a working `down`. **Migrations are reversible** — a one-way
  migration is a reviewed, documented exception, never a default.
- Migrations are **concurrency-safe** — safe to apply under live writes (no
  unguarded long lock on a large table; add columns nullable-then-backfill;
  build indexes concurrently).
- A migration is forward-only in production history — a mistake is fixed by a
  new migration, not by editing a shipped one.

### Indexing

- Index for the queries the service actually runs — every hot query has a
  supporting index; no speculative indexes.
- Foreign-key and frequently-filtered columns are indexed.
- Partial indexes for the common filtered case (e.g.
  `WHERE state = 'published'`).

### Transactions

- Transaction boundaries live in `store`, not `domain`
  ([go-service-standards.md](go-service-standards.md)).
- A transaction is **as short as correctness allows** — no external calls, no
  user wait, inside a transaction.
- Concurrent contention uses explicit strategies (`FOR UPDATE SKIP LOCKED` for
  job-claim patterns), not optimistic hope.

## 2. Redis — cache & ephemeral state

- Redis holds **cache and ephemeral state** — never a system of record. A lost
  Redis is re-warmed from the source of truth, not "restored".
- **Key naming**: `next:<service>:<entity>:<id>` — namespaced by service so key
  spaces never collide.
- **Every cache key has a TTL.** An unbounded cache key is a violation. TTLs are
  chosen deliberately (short for volatile data, longer for stable).
- Eviction policy: `allkeys-lru` for pure caches; `noeviction` only for the few
  correctness-critical key spaces, which are documented.
- **Invalidation**: cache entries are invalidated on the authoritative write —
  not left to TTL when correctness needs promptness (e.g. entitlement revocation
  purges the cache synchronously, [docs/economy/entitlements.md](../economy/entitlements.md)).

## 3. ClickHouse — analytics warehouse

- ClickHouse is the analytics warehouse ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md)).
  **No service runs large analytical scans against its transactional Postgres.**
- Analytics tables are **derived and rebuildable** by replaying events —
  ClickHouse is not a system of record.
- **Event ingestion** flows through Kafka — if ClickHouse is unavailable,
  analytics events buffer in Kafka and drain on recovery; no analytics data is
  lost, only delayed.
- Analytics-table ownership follows the producing domain; an analytics dataset
  has one owning team.

## 4. Vector DB — Qdrant

- Embeddings live in Qdrant ([ADR 0005](../adr/0005-vector-database.md)),
  accessed via the designated retrieval service.
- Qdrant is a **rebuildable cache** of embeddings — authoritative recovery is
  regeneration by event replay, not a snapshot restore
  ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md)).
- **Index lifecycle**: a collection is versioned; a model bump creates a new
  collection → dual-read to parity → atomic alias swap → retire the old
  collection. Recommendation never queries a half-migrated collection.
- One owning subsystem per embedding space — no duplicate collections for the
  same space ([ai-system-standards.md](ai-system-standards.md)).

## 5. Cross-cutting

- **Migrations / schema changes** that other services observe are an
  architectural change — see [architecture governance](../governance/architecture-governance.md).
- **Currency / money** — monetary amounts are integer minor units, never floats
  ([docs/economy/ledger-architecture.md](../economy/ledger-architecture.md)).
- **PII / sensitive columns** — encrypted where required, access least-privilege,
  redacted in logs ([security-standards.md](security-standards.md)).
- **No secrets in schema or seed data.**

## 6. Prohibited patterns

- ✗ A service reading/writing another service's database.
- ✗ A migration with no `down`, without a documented reviewed reason.
- ✗ A migration that locks a large table under live traffic.
- ✗ A Redis key with no TTL (outside documented `noeviction` spaces).
- ✗ Treating Redis, ClickHouse, or Qdrant as a system of record.
- ✗ Large analytical queries against a transactional Postgres.
- ✗ Monetary values stored as floats.
- ✗ Duplicate vector collections for one embedding space.

## Related

- [ADR 0017](../adr/0017-database-per-service.md) · [ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md) · [ADR 0005](../adr/0005-vector-database.md) · [go-service-standards.md](go-service-standards.md) · [docs/resilience/disaster-recovery.md](../resilience/disaster-recovery.md)
