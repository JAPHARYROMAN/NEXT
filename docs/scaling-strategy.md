# Scaling strategy

Per [§14 Architecture](ARCHITECTURE.md#14-scaling-strategy).

## Compute

- **HPA per service**, scaling on CPU + per-service custom metric (latency P95, queue depth, GPU memory).
- **Karpenter** binpacks workloads onto right-sized nodes. Average pod scheduling: < 30 s on a fresh node.
- **KEDA** for queue-driven scaling (Kafka consumer groups; SQS for image processing fallbacks).
- **PDB** keeps ≥ 50 % of pods available during voluntary disruption.

## Stateful tiers

| Store | Vertical | Horizontal |
| --- | --- | --- |
| **Postgres (RDS)** | Up to `db.r7g.16xlarge` per service. | Service split before sharding; per-service DB cap of ~5 TB. |
| **Redis (ElastiCache)** | Limited; cluster mode from day one. | Add shards via `num_node_groups`; rebalance live. |
| **Kafka (MSK)** | Add brokers + partitions for new topics. | Partition counts plan: see [docs/event-architecture.md](event-architecture.md). |
| **ClickHouse** | Single-node up to 32 vCPU. | Add shards via Keeper; per-shard replicas = 2. |
| **OpenSearch** | Hot tier scaling vertically up to or1.16xlarge.search. | Hot → warm → cold tiering on S3 keeps hot-tier small. |
| **Qdrant** | Vertical until ~30 M vectors/pod. | Collection sharding by tenant; replication factor = 2. |
| **S3** | n/a | Effectively unlimited; partition prefix scheme avoids hot-spot throttling. |

## AI scaling

- **Inference**: Triton + KEDA scaling on queue depth and GPU memory utilization.
- **LLM**: vLLM continuous batching; horizontal scaling on KV-cache utilization.
- **Embedding backfill**: Ray Data spot fleet, scaled to spot capacity, paused under capacity pressure.
- **Training**: Ray Train on on-demand p5 fleet; provisioned just-in-time via Karpenter NodePools.

## Regional

- **v1** (today): single region (`us-east-1`).
- **v2**: active-active for the read path. Writes route to a user's "home" region (Route 53 geolocation + signed-region cookie).
- **v3**: per-region data residency for jurisdictions that require it.

Region replication:
- **Aurora Global Database** for write-once-read-many tables (catalog, profile).
- **MirrorMaker 2** for Kafka.
- **S3 CRR** for media.
- **Qdrant Cloud-like cross-region replication** via custom snapshot streaming.

## Cost envelopes

We track cost per request, per active user, and per video served. Engineering owns the cost story — every domain has a Grafana cost panel updated nightly from AWS CUR data.

## Capacity planning

Quarterly capacity exercise:
1. Forecast traffic from analytics-service growth curves.
2. Run a load test at 2× current peak in staging.
3. File RIs / SPs for predictable workloads.
4. Document headroom per Tier 1 service in `docs/runbooks/capacity-<yyyy-q>.md`.
