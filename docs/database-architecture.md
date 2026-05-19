# Database architecture

Per [ADR 0017](adr/0017-database-per-service.md): **one database per service**. Nothing is shared.

## Stores

| Store | Use | Examples |
| --- | --- | --- |
| **Postgres (RDS)** | OLTP for relational entities | auth, profile, media, community, payment, notification, moderation |
| **Redis (ElastiCache)** | Caches, rate limits, sessions, timelines, presence | auth, feed, live, community, recommendation |
| **ClickHouse** | Columnar analytics | analytics (terminal sink), moderation (high-recall fingerprint) |
| **OpenSearch** | Full-text + log search | search, observability |
| **Qdrant** | Vector ANN | recommendation, search, moderation |
| **S3** | Object storage + ML artifacts | media, upload, live, ai/* |

## Per-service ownership

| Service | OLTP | Cache | Other |
| --- | --- | --- | --- |
| `auth-service` | Postgres `auth_pg` | Redis `auth_redis` | Vault Transit (signing keys) |
| `profile-service` | Postgres `profile_pg` | Redis `profile_redis` (follower counts) | — |
| `media-service` | Postgres `media_pg` | — | S3 `next-media-<env>` |
| `upload-service` | Postgres `upload_pg` | — | S3 `next-uploads-<env>` |
| `live-service` | — | Redis `live_redis` (stream state) | S3 `next-live-<env>` |
| `feed-service` | — | Redis `feed_redis` (timelines) | — |
| `recommendation-service` | — | Redis `rec_redis` (feature store) | Qdrant `videos`, `creators` |
| `search-service` | — | Redis `search_redis` (top queries) | OpenSearch + Qdrant |
| `community-service` | Postgres `community_pg` | Redis `community_redis` (presence) | — |
| `payment-service` | Postgres `payment_pg` | — | KMS for envelope encryption |
| `notification-service` | Postgres `notification_pg` | Redis `notification_redis` | APNs / FCM |
| `moderation-service` | Postgres `moderation_pg` | — | ClickHouse `moderation_ch` (fingerprints) |
| `analytics-service` | — | — | ClickHouse `analytics_ch` (terminal sink) |
| `event-gateway` | Postgres `event_gateway_pg` (idempotency) | — | — |
| `api-gateway` | none | — | none |

## Replication + backup

| Store | Replication | Backup |
| --- | --- | --- |
| Postgres | Multi-AZ + read replicas | Continuous WAL → S3; 35-day PITR |
| Redis | Cluster mode, replication factor 1 | RDB snapshot every 6 h to S3 |
| ClickHouse | 3 shard × 2 replica | `BACKUP` hourly to S3 |
| OpenSearch | 3 master + 6 data hot, UltraWarm tier | Snapshot every 4 h to S3 |
| Qdrant | Replication factor 2 | Snapshot every 6 h to S3 |
| S3 | Versioning + CRR (v2) | Lifecycle policies (IA → Glacier) |

## Migrations

- Go services: [`golang-migrate`](https://github.com/golang-migrate/migrate). SQL files in `services/<svc>/migrations/`.
- Python services: Alembic.
- Forward-only. Reverses exist for emergencies but are not the migration story.
- ArgoCD `SyncWave` runs migrations as a Helm pre-install hook before the new pod rolls out.

## Cross-service queries

**Forbidden.** Services do not read each other's databases. Cross-service queries are:

- **Event-driven projections** — search-service maintains its own index from `media.video.published.v1`.
- **RPC** — when a synchronous read is needed (e.g. `ProfileService.Get` from feed-service).
- **Analytics** — `analytics-service` joins everything via ClickHouse for reporting.

A static CI check fails any service connecting to another's DB.
