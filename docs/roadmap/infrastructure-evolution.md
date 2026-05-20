# Infrastructure Evolution

> What scales linearly, what hits a wall, and what must be redesigned — a
> ten-year honest accounting of where NEXT's infrastructure holds and where it
> will need new architecture.

## 0. Principle

Infrastructure evolution is told as three honest categories for each system:
**scales linearly** (just add capacity), **needs redesign** (a wall is coming),
**becomes a bottleneck** (watch it). The point is to name the redesigns _before_
they are emergencies — each one becomes a future ADR, scheduled, not improvised.

## 1. Compute & orchestration

- **Scales linearly** — stateless services on EKS + Karpenter
  ([ADR 0011](../adr/0011-kubernetes.md)). Horizontal scaling and multi-region
  active-active ([docs/resilience/global-topology.md](../resilience/global-topology.md))
  carry NEXT a long way.
- **Watch** — cross-region coordination cost for single-writer stateful systems
  as regions multiply.
- **Likely redesign (~10 yr)** — if the single-primary-per-stateful-system model
  strains, selective multi-primary / globally-distributed datastores for the
  hottest data. A significant future ADR.

## 2. Media delivery & storage

- **Scales linearly** — CDN edge delivery; the edge absorbs viral and live spikes
  ([docs/resilience/media-resilience.md](../resilience/media-resilience.md)).
- **Watch** — egress bandwidth cost (NEXT's largest cost line) and monotonic
  storage growth — immutable masters never shrink ([ADR 0026](../adr/0026-storage-tiering.md)).
- **Needs redesign (~5–8 yr)** — spatial/volumetric media delivery
  ([immersive-computing.md](immersive-computing.md), [media-evolution.md](media-evolution.md))
  is **not** a linear extension of HLS/DASH; new codecs, new edge behavior, new
  delivery architecture. Gated with Phase E.

## 3. Event systems

- **Scales linearly** — Kafka category streams ([ADR 0036](../adr/0036-event-topology.md));
  partitions add cleanly; cross-region mirroring is established.
- **Watch** — total partition count and cross-region mirror lag as event volume
  and region count grow.
- **Likely redesign (~8–10 yr)** — at extreme scale, tiered/streaming storage
  strategy and possibly stream-processing topology changes; the _category-stream
  contract_ should survive even if the substrate beneath it is re-engineered.

## 4. Semantic indexing & vector systems

- **Scales sub-linearly today** — vector search cost grows faster than data; the
  most likely engineering pressure point of the whole roadmap.
- **Becomes a bottleneck** — as semantic understanding moves from enrichment to
  _load-bearing_ ([discovery-evolution.md](discovery-evolution.md),
  [media-evolution.md](media-evolution.md)), index size and query volume rise
  sharply.
- **Needs redesign (~5 yr)** — the semantic-discovery substrate: tiered/ANN
  indexing strategy, possibly a purpose-built semantic store beyond the current
  Qdrant deployment ([ADR 0005](../adr/0005-vector-database.md)). A flagged
  future ADR — and it is a _when_, not an _if_.

## 5. AI / GPU infrastructure

- **Does not scale linearly** — GPU is supply-constrained, expensive, and
  long-lead-time; the hardest capacity-planning problem
  ([docs/resilience/capacity-planning.md](../resilience/capacity-planning.md)).
- **Watch** — inference cost per served experience as AI weaves deeper into the
  product ([ai-evolution.md](ai-evolution.md)).
- **Needs redesign / continuous evolution** — model efficiency, on-device and
  edge inference for the right workloads, and a serving topology
  ([ADR 0016](../adr/0016-ai-serving.md)) that keeps inference cost sub-linear
  to usage. This is ongoing engineering, not a one-time redesign.

## 6. Edge computing

- **Growing role** — today the edge does CDN caching. Over the roadmap it does
  more: edge inference, spatial compute, ambient-interface support
  ([immersive-computing.md](immersive-computing.md)).
- **Needs new architecture (~5–8 yr)** — an edge-compute platform beyond
  caching: a deliberate decision about what logic and inference run at the edge
  vs. the region. A future ADR.

## 7. Databases

- **Scales well** — database-per-service ([ADR 0017](../adr/0017-database-per-service.md))
  with per-region replicas; ClickHouse for analytics ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md)).
- **Watch** — the hottest single-writer services; the largest Postgres
  instances may need sharding.
- **Likely redesign (~8–10 yr)** — selective sharding or distributed-SQL for the
  hottest data domains; the per-service isolation principle survives, the
  storage engine under a given service may not.

## 8. The bottleneck ranked

If the roadmap has one infrastructure bottleneck to watch above all others, it
is **semantic indexing / vector search** (§4). It is the system that (a) does
not scale linearly today, (b) moves from optional to load-bearing as discovery
and media evolve, and (c) has no clean "just add capacity" answer. It should get
a dedicated redesign ADR on the ~5-year horizon, ahead of need.

## 9. The "rebuildable" property is a scaling asset

NEXT's derived stores — embeddings, analytics rollups, feed state, trust scores,
the trust/identity graphs — are **rebuildable by replaying the event log**
([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).
This is not only a resilience property; it is a _scaling_ property. It means a
derived store can be **re-architected, re-sharded, or replaced** by standing up
the new design and replaying history into it — no risky in-place migration of
the system of record. Every redesign named above is made far safer by it. The
event log is the fixed point that lets everything else evolve.

## 10. Future ADRs implied

- A semantic-discovery substrate redesign (~5 yr, the priority).
- An edge-compute platform architecture (~5–8 yr).
- A spatial/volumetric media delivery architecture (Phase-E gated).
- Selective multi-primary / distributed-data strategy for the hottest domains
  (~8–10 yr).

## Related documents

- [docs/resilience/global-topology.md](../resilience/global-topology.md) · [docs/resilience/capacity-planning.md](../resilience/capacity-planning.md) · [media-evolution.md](media-evolution.md) · [discovery-evolution.md](discovery-evolution.md) · [ai-evolution.md](ai-evolution.md)
