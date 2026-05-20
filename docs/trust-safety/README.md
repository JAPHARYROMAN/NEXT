# NEXT Trust & Safety Architecture

The integrity layer of NEXT — how the platform stays safe, creative, open, and
authentic at the same time. This is **architecture**: design documents, not yet
implemented services.

> Protect users without killing culture. Protect creators without enabling
> abuse. Preserve humanity while scaling intelligence.

## Documents

| Doc                                                            | Covers                                                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [trust-architecture.md](trust-architecture.md)                 | Trust scoring for users, creators, communities; the event-driven model; decay; the trust graph; the six invariants.     |
| [moderation-pipelines.md](moderation-pipelines.md)             | The five-layer moderation pipeline; multimodal (text/vision/audio/video); the severity taxonomy; the child-safety path. |
| [live-moderation.md](live-moderation.md)                       | Sub-second live-stream moderation; the broadcast-delay buffer; the graceful intervention ladder; raid detection.        |
| [creator-authenticity.md](creator-authenticity.md)             | Verification facts; authenticity scoring; impersonation detection; synthetic-media disclosure; protecting pseudonymity. |
| [appeals-system.md](appeals-system.md)                         | Enforcement explanations; the appeals pipeline; transparency reports; the audit log; no shadow punishment.              |
| [risk-intelligence.md](risk-intelligence.md)                   | Coordinated-abuse, bot-farm, fraud and account-takeover detection; graph analysis; adaptive friction.                   |
| [platform-governance.md](platform-governance.md)               | The policy framework; moderation taxonomy; severity tiers; the enforcement ladder; the proposed service map.            |
| [recommendation-integration.md](recommendation-integration.md) | How trust integrates with discovery — eligibility filter + manipulation discount only, never a ranking boost.           |

## The doctrine in one paragraph

NEXT's integrity layer prioritizes **nuance, proportionality, transparency,
explainability, and context** over blunt suppression. Trust is event-driven,
decomposable, decaying, and never permanent. Moderation is a five-layer pipeline
where cheap fast layers route and humans decide; ambiguity escalates rather than
defaulting to removal; over-blocking is a tracked failure. Every consequence is
disclosed, explained, and appealable — there is **no shadow enforcement**. Risk
intelligence acts on coordination patterns with friction before punishment. And
trust integrates with the feed strictly as an abuse filter, never as a ranking
boost — so the platform never becomes an algorithmic class system.

## Grounding

This architecture builds on, and stays consistent with:

- the existing `trust-service` (deep) and `moderation-service` (scaffold);
- [ADR 0024](../adr/0024-trust-score-event-driven.md) — trust is event-driven;
- [ADR 0036](../adr/0036-event-topology.md) / [ADR 0039](../adr/0039-event-schema-source-of-truth.md) — event streams use category topics + proto schemas;
- [ADR 0031](../adr/0031-anti-homogenization.md) — creator fairness; trust must not become popularity bias;
- [ADR 0022](../adr/0022-access-control-rego.md), [ADR 0023](../adr/0023-identity-graph-neo4j.md), [ADR 0017](../adr/0017-database-per-service.md), [ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md).

## Scope of this phase

Architecture only. The proposed services in
[platform-governance.md](platform-governance.md) §6 are **designed, not
implemented** — implementation is a separate, later, explicitly-assigned task,
and would follow the canonical Go service layout
([ADR 0038](../adr/0038-canonical-go-service-layout.md)). Several decisions here
(trust↔recommendation integration, the five-layer pipeline, the no-shadowban
rule) are load-bearing enough to warrant their own ADRs when implementation is
scheduled.
