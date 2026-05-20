# NEXT Disaster Recovery

> What NEXT does when something is genuinely lost — an availability zone, a
> region, a database, a cluster. Recovery is **planned, drilled, and bounded by
> explicit RPO/RTO targets** — never improvised.

> This is the detailed DR doctrine. It expands the top-level
> `docs/disaster-recovery.md` summary; where they differ, this document governs.

## 0. Doctrine

- **Plan, then drill.** A DR procedure that has not been rehearsed does not
  exist. Restore drills run on a schedule ([chaos-engineering.md](chaos-engineering.md)).
- **RPO/RTO are explicit and tiered.** Every system has a stated recovery-point
  and recovery-time objective; they drive the backup and replication design,
  not the other way round.
- **Backups are tested, not assumed.** An untested backup is a guess. Restores
  are verified regularly.
- **Recovery is automated for T0, confirmed-automatic for T1.** Humans approve;
  they do not hand-type recovery steps under pressure.

## 1. Failure scope ladder

| Scope                | Example                                       | Primary defense                                                     |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Node                 | EKS node loss                                 | Karpenter reschedules; no user impact                               |
| Availability zone    | AZ outage                                     | multi-AZ (≥ 3) per region; in-region absorption                     |
| Region               | region-wide AWS failure                       | multi-region failover ([global-topology.md](global-topology.md) §6) |
| Datastore            | a Postgres / Kafka / ClickHouse cluster fails | replication + standby promotion (below)                             |
| Data corruption      | bad migration, bad write, ransomware          | point-in-time recovery from backups                                 |
| Global control plane | GitOps / DNS provider issue                   | documented manual fallback runbook                                  |

DR concerns the bottom four rows; node and AZ loss are handled transparently by
the topology.

## 2. RPO / RTO targets

| System / tier                     | RPO (max data loss)           | RTO (max downtime)        |
| --------------------------------- | ----------------------------- | ------------------------- |
| T0 — auth, playback, event ingest | ≈ 0 (synchronous replication) | minutes                   |
| T1 — media, feed, search, upload  | seconds                       | tens of minutes           |
| T2 — recommendation AI, analytics | minutes (rebuildable)         | hours; degraded meanwhile |
| T3 — batch, reporting             | hours                         | best-effort               |

RPO ≈ 0 for T0 is achieved with synchronous replication on the critical
datastores; everything rebuildable from events (embeddings, analytics rollups,
feed state) has a generous RPO because it is _regenerated_, not _restored_.

## 3. Datastore recovery

### PostgreSQL (per-service, [ADR 0017](../adr/0017-database-per-service.md))

- **Replication** — a synchronous standby in the primary region (zero-RPO) plus
  asynchronous cross-region read replicas.
- **Failover** — standby promotion on primary loss; automatic for T0 services,
  confirmed-automatic for T1.
- **Backups** — continuous WAL archiving to S3 + periodic base backups.
- **PITR** — point-in-time recovery to any moment in the retention window — the
  defense against corruption and bad migrations, which replication alone cannot
  fix (it would replicate the corruption).

### Redis

- **Role** — cache and ephemeral state; the source of truth is always elsewhere.
- **Replication** — replicas per region; AOF persistence for warm restart.
- **Recovery** — a lost Redis is **rebuilt by re-warming from the source of
  truth**, not restored. Eviction policy: `allkeys-lru` for caches,
  `noeviction` for the few correctness-critical key spaces.
- A cold cache is a performance event, not a data-loss event.

### ClickHouse ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md))

- **Replication** — ReplicatedMergeTree across nodes; regional ingest.
- **Ingestion continuity** — if ClickHouse is unavailable, analytics events
  **buffer in Kafka** (Kafka is the durable boundary) and drain on recovery —
  no analytics data is lost, it is delayed.
- **Backups** — periodic; analytics is also largely rebuildable by event replay.

### Neo4j ([ADR 0023](../adr/0023-identity-graph-neo4j.md))

- **Replication** — causal cluster, primary + read replicas.
- **Backups** — scheduled full + incremental; graph is also reconstructable from
  the identity/trust event streams.

### Qdrant ([ADR 0005](../adr/0005-vector-database.md))

- **Role** — a **rebuildable cache** of embeddings. Snapshots exist for fast
  recovery, but the authoritative recovery path is **regeneration from the event
  log** ([ai-resilience.md](ai-resilience.md)). Losing Qdrant degrades semantic
  features; it does not lose data.

## 4. Object storage (media)

Media masters are immutable ([ADR 0026](../adr/0026-storage-tiering.md)) and
stored in S3 with **cross-region replication**. A region loss does not lose a
master. Renditions are regenerable from masters; the CDN holds the hot set. See
[media-resilience.md](media-resilience.md).

## 5. Regional failover runbook

A summary; the operational step-by-step lives in a restricted runbook.

1. **Detect** — health checks + alerting confirm region loss (not a transient
   blip — a confirmation window prevents flapping).
2. **Drain** — Route 53 removes the region; stateless traffic shifts to peers.
3. **Promote** — for each stateful primary in the lost region, promote its
   standby in a peer region. T0 automatic; T1 confirmed-automatic.
4. **Re-point** — services in surviving regions re-resolve to the promoted
   primaries (via service discovery, not config edits).
5. **Verify** — SLO dashboards confirm the surviving regions are serving within
   degraded-but-acceptable bounds.
6. **Recover** — when the lost region returns, it re-syncs from current
   primaries _before_ being re-added to DNS; primaries are rebalanced
   deliberately, off-peak.

## 6. Backup & restore testing

- **Restore drills** — backups are restored into an isolated environment on a
  fixed cadence and validated; a backup that has not been restored is not
  trusted.
- **Failover game days** — regional and datastore failover are exercised as
  chaos experiments ([chaos-engineering.md](chaos-engineering.md)).
- **DR metrics** — actual achieved RPO/RTO from each drill are tracked against
  the targets in §2; a miss is a tracked defect.

## 7. Data-corruption response

Corruption is the case replication cannot fix. Response: identify the corruption
window, PITR-restore the affected datastore to just before it, and **replay
events** from that point to rebuild derived state. This is why event durability
([event-stream-resilience.md](event-stream-resilience.md)) and the
"rebuildable from events" property of derived stores are core DR mechanisms,
not just nice properties.

## Related documents

- [global-topology.md](global-topology.md) · [event-stream-resilience.md](event-stream-resilience.md) · [chaos-engineering.md](chaos-engineering.md) · [incident-response.md](incident-response.md)
