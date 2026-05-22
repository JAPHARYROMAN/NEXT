# NEXT Capacity Planning

> Resilience assumes there is capacity to fail over _into_. Capacity planning is
> how NEXT makes sure the headroom the rest of this directory depends on
> actually exists — ahead of demand, not after the outage.

## 0. Doctrine

- **Plan ahead of demand.** Capacity is provisioned against a forecast, with
  lead time for the slow-to-acquire resources (GPUs especially).
- **Headroom is a feature.** N+1 regional headroom is what makes failover
  non-disruptive ([global-topology.md](global-topology.md) §4); it is budgeted,
  not treated as waste.
- **Autoscale the elastic, forecast the slow.** Stateless compute autoscales
  reactively; GPUs, storage, and Kafka are forecast and provisioned proactively.
- **Measure saturation, not just usage.** The signal that matters is _how close
  to the limit_, per resource, per region.

## 1. What is elastic vs. what must be forecast

| Resource                      | Mode                  | Mechanism                                                                                      |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| Stateless EKS compute         | reactive autoscale    | HPA + Karpenter ([ADR 0011](../adr/0011-kubernetes.md))                                        |
| CDN / edge                    | elastic               | provider-managed; pre-warm for known events                                                    |
| GPU pools                     | **forecast**          | long lead time; on-demand (online) + spot (batch)                                              |
| Kafka partitions / brokers    | **forecast**          | partitions add easily, never remove ([event-stream-resilience.md](event-stream-resilience.md)) |
| Object storage                | **forecast (growth)** | grows monotonically; tiered ([ADR 0026](../adr/0026-storage-tiering.md))                       |
| Postgres / ClickHouse / Neo4j | **forecast**          | stateful; resize and re-shard with lead time                                                   |

Reactive autoscaling handles minute-to-minute load; capacity _planning_ is about
the slow, expensive, or unidirectional resources where reacting too late means
an outage.

## 2. Headroom targets

| Scope                    | Target                            | Why                                                               |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------- |
| Per-region T0/T1, normal | utilization well below saturation | room for organic spikes                                           |
| Cross-region             | **N+1** for T0/T1                 | peer regions absorb a full region loss without provisioning lag   |
| GPU online inference     | buffer above peak                 | absorb a node loss + a demand spike without degrading             |
| Kafka                    | partition + throughput headroom   | a producer surge cannot saturate the bus                          |
| Live events              | pre-provisioned to forecast peak  | a live spike has a hard start time — reactive scaling is too late |

Headroom is sized so the _failure case_ (a region down, a node lost) still fits
— not just the happy path.

## 3. Forecasting inputs

Capacity forecasts combine:

- **Historical growth** — trended usage per resource per region.
- **Product roadmap** — known launches, new regions, new AI features.
- **Seasonality + events** — predictable peaks (regional prime time, scheduled
  live events, cultural moments).
- **Creator-ecosystem growth** — uploads and catalog size drive storage,
  transcoding, and embedding load.

Forecasts are revisited each operational phase and after any large deviation.

## 4. Domain-specific planning

### Media bandwidth — the dominant cost

Egress bandwidth is NEXT's largest infrastructure cost. Planning models:
concurrent viewers × bitrate distribution × CDN cache-hit ratio. Levers: the
transcode ladder ([ADR 0025](../adr/0025-transcoding-ladder.md)) keeps bitrate
efficient; CDN cache-hit ratio is a primary tracked metric — a small hit-ratio
gain is a large egress saving. Live events are modeled separately (concurrent,
not long-tail).

### Storage growth

Media storage grows monotonically — masters are immutable and kept
([ADR 0026](../adr/0026-storage-tiering.md)). Tiering (hot → warm → cold) is the
cost lever: aging cold content to cheaper tiers keeps growth affordable. The
forecast is upload-rate driven; it is a growth curve, not a peak.

### Kafka

Forecast partition count and broker throughput from event volume per category
stream. Partitions are added with headroom (consumers tolerate additions,
[event-stream-resilience.md](event-stream-resilience.md)); throughput headroom
ensures a producer surge has somewhere to go.

### AI / GPU

GPUs have the **longest lead time and the tightest supply** — they are the
capacity risk most likely to bite. Plan online-inference GPU against forecast
peak QPS per model with failure headroom; plan batch GPU (training, embedding)
on spot with checkpointing so interruptions are cheap. A looming GPU shortfall
is surfaced early as a planning item, well before it becomes an SLO breach
([ai-resilience.md](ai-resilience.md)).

### Edge traffic

Forecast per-region edge demand; pre-warm and pre-provision for scheduled large
live events rather than relying on reactive scaling for a hard-start spike.

## 5. Saturation monitoring

Every planned resource has a **saturation SLI** — current usage as a fraction of
capacity — on the operations dashboards ([sre-doctrine.md](sre-doctrine.md)):

- a **warning** threshold triggers a planning review;
- a **critical** threshold triggers expedited provisioning;
- sustained saturation that cannot be provisioned around becomes an incident.

Saturation is tracked _per region_ — a global average can hide a region about to
run out.

## 6. Capacity & resilience together

Capacity planning and resilience are one loop:

- failover ([global-topology.md](global-topology.md), [disaster-recovery.md](disaster-recovery.md))
  only works if the **N+1 headroom** is really there;
- chaos game days ([chaos-engineering.md](chaos-engineering.md)) **validate**
  that headroom by actually shifting a region's load onto its peers;
- load + spike game days validate that forecast peak capacity is real.

A capacity plan that has never been exercised by a failover game day is, like an
untested backup, only a guess.

## Related documents

- [global-topology.md](global-topology.md) · [media-resilience.md](media-resilience.md) · [ai-resilience.md](ai-resilience.md) · [chaos-engineering.md](chaos-engineering.md) · [sre-doctrine.md](sre-doctrine.md)
