# 0031. Anti-homogenization and creator fairness as ranking constraints

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/discovery
- **Tags**: recommendation, fairness, culture

## Context

Every engagement-trained recommender drifts toward the same two pathologies:
feeds homogenize (repetitive, trend-cloned, emotionally flat) and creator
exposure concentrates (the popular get more signal, rank higher, get more
exposure). Left to a pure relevance objective, NEXT would reproduce both — and
that directly violates the constitution's mandate to preserve weirdness, small
creators, and cultural evolution.

## Decision

Diversity and creator fairness are **hard constraints inside ranking**, not
post-hoc filters or tie-breakers:

- **Per-session creator cap** — no creator > 25% of a session slate.
- **Popularity-offset bonus** — a creator's relevance is adjusted by
  `k·(1−normalized_exposure)`, so emerging creators compete on resonance, not
  incumbency.
- **Six-axis MMR** — slate selection enforces spread over creator, topic,
  aesthetic, pacing, format, exposure.
- **Long-tail recall guarantee** — long-tail / fresh / serendipity candidate
  sources are never budgeted to zero.
- **Trend-clone suppression** — near-duplicates of a viral template get a rising
  mutual-similarity penalty; the trend origin survives, the 500th clone does not.

These are enforced in code (stage 3) and as **auto-aborting guardrail metrics**
on every experiment (creator Gini, emerging-creator share, topic entropy,
exploration share).

## Alternatives considered

- **Pure relevance ranking** — simplest, highest short-term engagement,
  reproduces both pathologies. Rejected on doctrine.
- **Diversity as a soft tie-breaker** — too weak; loses to a strong relevance
  signal exactly when it matters most. Rejected.
- **A separate "discovery feed" for small creators** — ghettoizes them instead
  of integrating them. Rejected; fairness belongs in the main feed.

## Consequences

### Positive

- Structural protection for small/niche/experimental creators (invariant 4).
- Feeds stay culturally varied and emotionally breathable (invariants 2, 5).
- Fairness is measurable and CI-enforced for experiments, not aspirational.

### Negative

- Measurable short-term engagement cost vs. a pure relevance ranker — accepted
  explicitly as the price of ecosystem health.
- The offset constant `k` and the 25% cap are value judgments; they will be
  scrutinized and tuned, and that tuning is itself sensitive.

### Neutral / open questions

- "Engagement cartel" detection (creators mutually boosting) is handled coarsely
  by the per-creator cap for v1; a graph-based detector is future work.

## Implementation notes

- All constraints live in `recommendation-service` stage-3 selection.
- Fairness/diversity metrics stream to ClickHouse; guardrail thresholds are
  declared in the experimentation framework.
- See [docs/recommendation/fairness-systems.md](../recommendation/fairness-systems.md).
