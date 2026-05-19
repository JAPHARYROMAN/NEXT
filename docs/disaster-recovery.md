# Disaster recovery

## Tiers

| Tier | RPO | RTO | Services |
| --- | --- | --- | --- |
| **1** — Critical | < 1 min | < 15 min | api-gateway, auth-service, payment-service, media-service (playback path) |
| **2** — Standard | < 5 min | < 1 hr | profile, upload, feed, live, recommendation, search, community |
| **3** — Background | < 1 hr | < 4 hr | analytics, moderation backfill, search index rebuild |

## Backups

| Store | Mechanism | RPO | Retention |
| --- | --- | --- | --- |
| Postgres (RDS) | Continuous WAL → S3 + automated daily snapshot | 5 min PITR | 35 days |
| Redis | RDB snapshot every 6h + cross-region S3 copy | 6 h | 30 days |
| Kafka (MSK) | Tiered storage on S3; MirrorMaker to DR in v2 | Continuous | 90 days |
| ClickHouse | `BACKUP` to S3 hourly | 1 h | 30 days |
| OpenSearch | Snapshot to S3 every 4 h | 4 h | 30 days |
| Qdrant | Snapshot to S3 every 6 h | 6 h | 14 days |
| S3 (media, uploads) | Versioning + cross-region replication | RPO 0 | Indefinite |

Backups are *tested quarterly* — every store has a runbook entry that includes a verified restore exercise.

## Failure scenarios

### Single pod failure
Automatic: kubelet restart. PDB keeps service capacity. No human action.

### Single AZ failure
Automatic: workloads reschedule across remaining AZs. RDS Multi-AZ fails over. ElastiCache promotes a replica. Karpenter provisions in the remaining AZs.

### Region failure (v1)
Manual failover. Procedure:

1. Promote read-replica RDS in DR region (where present) or restore from latest snapshot.
2. Re-target Route 53 to DR region origin.
3. Replay Kafka offsets from S3-tiered storage into a fresh MSK cluster.
4. ArgoCD bootstraps the DR EKS cluster from the same git manifests.
5. Verify SLOs are green; release the failover.

Estimated RTO: 4 hours (Tier 1 down for at most 15 min if hot DR replica is ready in v2).

### Region failure (v2 — active-active)
Read traffic continues from the surviving region. Writes briefly fail; clients retry into the surviving region. RPO ≈ MirrorMaker lag (target < 10 s).

### Vault outage
ESO continues serving cached secrets. New workloads cannot read fresh secrets. Procedure: failover Vault to standby; if Raft quorum is lost, restore from S3 snapshot. Application impact is minimal due to cache TTL.

### Compromise / accidental deletion
- Postgres PITR within 5-minute window.
- S3 object versions are immutable; recovery restores prior version.
- Git is the single source of truth for cluster + infra state — revert and reconcile.

## Game days

Every quarter, the SRE team runs a game day:

1. **Q1**: AZ failure.
2. **Q2**: Random pod chaos (Chaos Mesh).
3. **Q3**: Vault outage.
4. **Q4**: Full-region failover drill.

Results land in `docs/runbooks/game-day-<yyyy-q>.md`.
