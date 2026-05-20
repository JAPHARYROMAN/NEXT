# NEXT Resilience & Scaling Architecture

The survivability layer of NEXT — how the platform scales planet-wide and stays
up, calm, and trustworthy under failure, spikes, and chaos. This is
**architecture**: design doctrine, not yet-implemented systems.

> Survive chaos. Recover gracefully. Preserve trust. Remain globally responsive.
> Scale without losing coherence.

## Documents

| Doc                                                      | Covers                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [global-topology.md](global-topology.md)                 | Multi-region AWS topology; active-active serving + primary/standby state; traffic routing; failover tiers T0–T3.    |
| [graceful-degradation.md](graceful-degradation.md)       | Per-subsystem degradation chains; circuit breakers; load shedding by tier — "degrade, never block".                 |
| [disaster-recovery.md](disaster-recovery.md)             | RPO/RTO targets; datastore recovery; the regional failover runbook; backup testing; corruption response.            |
| [event-stream-resilience.md](event-stream-resilience.md) | Kafka durability; cross-region mirroring; DLQ survivability; replay doctrine; acceptable-loss boundaries.           |
| [media-resilience.md](media-resilience.md)               | CDN + origin failover; ABR fallback; upload + transcode recovery; surviving viral spikes and live events.           |
| [ai-resilience.md](ai-resilience.md)                     | Model-serving + GPU failover; inference queue buffering; degraded AI modes; embedding regeneration by event replay. |
| [sre-doctrine.md](sre-doctrine.md)                       | SLIs / SLOs / error budgets; symptom-based alerting; the observability stack; telemetry survivability.              |
| [incident-response.md](incident-response.md)             | Severity classification; incident roles; on-call; rollback doctrine; security/abuse incidents; blameless review.    |
| [chaos-engineering.md](chaos-engineering.md)             | The steady-state hypothesis; the experiment catalog; the maturity ladder; game-day cadence.                         |
| [capacity-planning.md](capacity-planning.md)             | Elastic vs. forecast resources; headroom targets; media/storage/Kafka/GPU/edge planning; saturation monitoring.     |

## The doctrine in one paragraph

NEXT runs active-active across regions, with the blast radius of any failure
capped at one region. Every subsystem has a degradation chain that terminates in
something coherent — the platform degrades, it does not break. The event log is
the durable boundary, and most derived state (embeddings, analytics, feed,
trust) is rebuildable by replaying it. Reliability is engineered against SLOs and
spent against error budgets; failure is injected on purpose through chaos
experiments so the resilience design is proven, not assumed; and incidents are
run by a pre-agreed, blameless process. The platform is built to feel stable,
globally responsive, and operationally calm — even under planetary-scale stress.

## Grounding

Consistent with the infrastructure and platform ADRs: [0002](../adr/0002-cloud-target.md)
AWS · [0011](../adr/0011-kubernetes.md) EKS + Karpenter · [0003](../adr/0003-service-mesh.md)
Istio · [0004](../adr/0004-gitops-argocd.md) GitOps · [0008](../adr/0008-event-bus.md)
Kafka · [0009](../adr/0009-observability.md) observability · [0016](../adr/0016-ai-serving.md)
AI serving · [0017](../adr/0017-database-per-service.md) database-per-service ·
[0026](../adr/0026-storage-tiering.md) storage tiering · [0035](../adr/0035-clickhouse-analytics-warehouse.md)
ClickHouse · [0036](../adr/0036-event-topology.md) event topology.

This directory is the detailed resilience doctrine; it expands the earlier
top-level `docs/disaster-recovery.md` and `docs/scaling-strategy.md` summaries,
which should be reduced to pointers here.

## Scope of this phase

Architecture only. No services, manifests, or infrastructure were created or
modified. Several decisions here (the failover-tier model, the N+1 headroom
mandate, the cross-region Kafka mirroring topology, the zero-loss Tier-0 event
boundary) are load-bearing enough to warrant their own ADRs when the
corresponding infrastructure work is scheduled and assigned.
