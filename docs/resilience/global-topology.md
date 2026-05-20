# NEXT Global Topology

> How NEXT is deployed across the planet so that no single region, zone, or
> failure can take the platform down — and so a creator in Lagos and a viewer in
> Seoul both get a fast, local experience.

## 0. Doctrine

NEXT is a **multi-region, edge-fronted** platform on AWS ([ADR 0002](../adr/0002-cloud-target.md))
running EKS + Karpenter ([ADR 0011](../adr/0011-kubernetes.md)) in every region.
The doctrine:

- **No global single point of failure.** Every tier is either replicated across
  regions or has a defined cross-region failover.
- **Serve locally, coordinate globally.** Read and serving paths run in the
  region nearest the user; the small set of single-writer systems coordinate
  across regions explicitly.
- **Failure is regional, not planetary.** The blast radius of any failure is
  capped at one region; other regions absorb the traffic.
- **Degrade, never block** (the constitution) — see [graceful-degradation.md](graceful-degradation.md).

## 1. Regions

| Region code | Coverage      | Phase                                     |
| ----------- | ------------- | ----------------------------------------- |
| `na`        | North America | launch                                    |
| `eu`        | Europe        | launch                                    |
| `af`        | Africa        | launch — first-class, not an afterthought |
| `ap`        | Asia-Pacific  | launch                                    |
| `sa`        | South America | future                                    |

Each region is a full EKS deployment across **≥ 3 availability zones**. AZ-level
redundancy is the inner ring; region-level redundancy is the outer ring.

Africa is a launch region by design — NEXT is built for global creators, and
data locality + latency for African creators and audiences is a first-class
requirement, not a later expansion.

## 2. Active-active vs. active-passive

NEXT is **active-active for the serving plane** and **primary + standby for the
single-writer stateful plane**.

| Plane                                                                   | Topology                                                                                | Rationale                                                    |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Edge / CDN                                                              | active-active, all regions                                                              | every PoP serves; nearest-edge routing                       |
| Stateless serving (api-gateway, playback, feed serving, search serving) | active-active, all regions                                                              | horizontally scalable, no write coordination                 |
| Per-service Postgres ([ADR 0017](../adr/0017-database-per-service.md))  | primary region + cross-region read replicas + standby                                   | single-writer; reads served locally                          |
| Kafka (MSK, [ADR 0008](../adr/0008-event-bus.md))                       | per-region clusters + cross-region mirroring of canonical streams                       | local produce/consume; global visibility                     |
| ClickHouse ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md))  | regional ingest + replicated, central rollups                                           | analytics tolerates eventual consistency                     |
| Neo4j ([ADR 0023](../adr/0023-identity-graph-neo4j.md))                 | primary + replicas                                                                      | graph writes are low-volume                                  |
| Qdrant ([ADR 0005](../adr/0005-vector-database.md))                     | regional replicas                                                                       | rebuildable cache (see [ai-resilience.md](ai-resilience.md)) |
| AI training                                                             | centralized (one region)                                                                | training is batch, not latency-sensitive                     |
| AI inference                                                            | regional GPU pools where demand justifies; cross-region with a latency budget otherwise | GPU cost vs. latency trade                                   |

## 3. Traffic routing

```
 user ──▶ GeoDNS / latency routing (Route 53)
            │
            ▼
        regional edge (CloudFront PoP)  ──▶ static + cached media
            │  (dynamic / API)
            ▼
        regional ingress (Istio gateway)  ──▶ regional EKS service mesh
            │  (read)                          │  (write)
            ▼                                  ▼
        local read replica            primary-region writer (cross-region call)
```

- **GeoDNS + latency routing** picks the nearest healthy region.
- **Health-checked failover** — a region failing health checks is drained from
  DNS; traffic shifts to the next-nearest region automatically.
- **Edge-aware** — CloudFront absorbs cacheable media and static assets at the
  PoP; only cache-miss and dynamic traffic reaches a region.
- **Write routing** — a write in a non-primary region makes an explicit
  cross-region call to the owning service's primary; this is rare on the hot
  path (most hot-path traffic is reads).

## 4. Service failover tiers

Every service is assigned a **failover tier**; the tier sets failover priority,
capacity headroom, and degradation order.

| Tier   | Meaning                                      | Examples                                            | On regional loss                                                                                       |
| ------ | -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **T0** | Must survive — platform is "down" without it | auth, api-gateway, playback, CDN edge, event ingest | instant failover; pre-provisioned headroom in peer regions                                             |
| **T1** | Core experience                              | media-service, feed serving, search, upload         | fast failover; brief degradation acceptable                                                            |
| **T2** | Enriched experience                          | recommendation AI, discovery, analytics             | degrade to fallbacks ([graceful-degradation.md](graceful-degradation.md)); failover as capacity allows |
| **T3** | Non-critical                                 | batch jobs, reporting, non-urgent pipelines         | may pause during an incident                                                                           |

Capacity planning ([capacity-planning.md](capacity-planning.md)) keeps **N+1
regional headroom** for T0/T1 — peer regions can absorb a full region's T0/T1
load without provisioning lag.

## 5. Regional responsibilities

- Every region runs the **full stateless stack** — no region is "serving only".
- A **primary region per stateful system** owns writes (chosen for the data's
  population centroid; spread across regions so no one region is the writer for
  everything).
- AI training is centralized; inference is regionalized by demand.
- A region carries metadata declaring which stateful primaries it hosts, so
  failover orchestration knows what must be promoted on loss.

## 6. Regional failure handling

When a region is lost (see [disaster-recovery.md](disaster-recovery.md) for the
full runbook):

1. Health checks fail → Route 53 drains the region from DNS within the
   health-check interval.
2. Stateless traffic shifts to peer regions (pre-provisioned headroom absorbs it).
3. For any stateful primary hosted in the lost region, a standby in a peer
   region is **promoted** (automatic for T0; confirmed-automatic for T1).
4. Kafka consumers in peer regions continue from mirrored streams.
5. The platform runs degraded-but-up on the surviving regions until the lost
   region is restored and re-synced.

The user-visible result of losing an entire region should be **higher latency
for some users and some features in fallback mode** — never an outage.

## Related documents

- [graceful-degradation.md](graceful-degradation.md) · [disaster-recovery.md](disaster-recovery.md) · [event-stream-resilience.md](event-stream-resilience.md) · [capacity-planning.md](capacity-planning.md)
