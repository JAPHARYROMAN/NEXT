# 0024. Trust score is event-driven, not API-driven

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/trust-safety @next-ecosystem/identity
- **Tags**: trust, identity, events

## Context

`trust-service` needs to compute a per-account trust score from many signals: login frequency + geography (auth), interaction patterns (feed), content authenticity (media + moderation), graph centrality (identity-graph). Two ways to wire this:

1. **API-driven**: each producer service calls `trust-service.AddSignal(…)` synchronously.
2. **Event-driven**: `trust-service` subscribes to the existing event streams and computes from them.

## Decision

**Event-driven.** `trust-service` consumes the Kafka topics it already cares about — `auth.session.*`, `profile.follow.*`, `media.video.*`, `feed.interaction.v1`, `moderation.case.decided.v1` — and updates trust scores asynchronously. Emits `trust.score.updated.v1` on meaningful changes.

## Alternatives considered

- **Synchronous API** — couples producer hot paths to trust-service availability; trust outages would degrade login latency, feed serves, etc.
- **Periodic batch (Ray)** — would work for the model side, but real-time signals like a sudden burst of failed logins need to feed scoring quickly.

We use both: real-time consumer for low-latency signals + periodic batch for re-training the weights.

## Consequences

### Positive

- `trust-service` is a leaf — it never blocks producer hot paths.
- Backfill is replay: drain a topic to rebuild scores.
- New signals don't require schema changes on producer services.

### Negative

- Eventual consistency: a freshly registered user has no trust score until consumers fire. Downstream consumers default `trust_score = 0.5` (neutral) on missing.
- Re-scoring decisions over time complicate audit (which version of the score gated which action). Mitigated by recording the score at decision time.

## Implementation notes

- Phase 5 scaffolds the service shell + topic subscriptions, with a constant-score function.
- Phase 8 swaps in the real model (gradient boosting on engineered features; the long-term path is graph + temporal models from `multimodal-pipelines`).
- The score is **always** reversible. Trust never burns down permanently from a single signal.
