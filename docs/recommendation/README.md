# Recommendation & Discovery Docs

The intelligence core of NEXT — how content finds people and how people find the
unexpected.

| Doc                                              | Covers                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [architecture.md](architecture.md)               | System shape, service map, the four-stage pipeline, data + vector architecture, doctrine & invariants. |
| [discovery-modes.md](discovery-modes.md)         | Precision / Discovery / Chaos — the continuous exploration-appetite model.                             |
| [ranking-system.md](ranking-system.md)           | The four ranking stages, scoring contract, what ranking does _not_ optimize.                           |
| [embedding-pipelines.md](embedding-pipelines.md) | The six embedding spaces, their pipelines, versioning, drift monitoring.                               |
| [fairness-systems.md](fairness-systems.md)       | Creator fairness, anti-homogenization, interest-graph decay, emotional pacing.                         |
| [experimentation.md](experimentation.md)         | Resonance as primary metric, guardrails, rollout safety, replay simulation.                            |

## Related ADRs

- [0029 — Three discovery modes](../adr/0029-three-discovery-modes.md)
- [0030 — Multi-stage ranking with diversity-before-rerank](../adr/0030-multi-stage-ranking.md)
- [0031 — Anti-homogenization as ranking constraints](../adr/0031-anti-homogenization.md)
- [0032 — Interest graph with affinity decay](../adr/0032-interest-graph-decay.md)

## The one-paragraph version

NEXT recommends in a four-stage funnel: wide cheap recall, lightweight ranking,
a semantic cross-encoder, diversity balancing, and a final pacing-aware rerank.
It moves continuously between Precision, Discovery, and Chaos modes based on
session behavior. It optimizes for **resonance** — long-term satisfaction,
curiosity, creator diversity — never watch time or compulsion. Five invariants
(exploration floor, no creator monopoly, decaying interests, reachable long
tail, breathing feeds) are enforced as code-level constraints and as
auto-aborting experiment guardrails, not as aspirations.
