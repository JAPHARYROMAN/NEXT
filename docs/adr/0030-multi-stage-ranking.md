# 0030. Multi-stage ranking with diversity balancing before final rerank

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/discovery
- **Tags**: recommendation, ranking, performance

## Context

Scoring every candidate with an expensive cross-encoder does not scale —
candidate sets are thousands of items and the latency budget is ~130 ms
end-to-end. We also need diversity and creator fairness to _shape_ the slate,
not merely reorder a slate that is already homogeneous.

## Decision

Ranking is a four-stage funnel: (1) lightweight ranking, (2) semantic
cross-encoder ranking, (3) **diversity balancing**, (4) final rerank. Each stage
is more expensive and more selective than the last. Diversity balancing (MMR
over six axes + creator-fairness offset) runs as **stage 3 — before** the final
rerank — so it selects which ~80 of ~200 candidates survive, rather than
polishing an already-decided slate.

Stage 2 emits `relevance` and `novelty` as separate scores so stage 4 can weight
them per discovery mode.

## Alternatives considered

- **Single-stage full scoring** — cross-encode everything. Blows the latency
  budget by orders of magnitude. Rejected.
- **Diversity as a final polish** — cheap, but it can only reorder; if the top
  candidates are all one creator, a final-step shuffle cannot fix it. Rejected.
- **Learned end-to-end slate model** — promising, operationally heavy, hard to
  reason about and to constrain. Revisit later; not v1.

## Consequences

### Positive

- Expensive computation only touches items that survived cheaper stages — fits
  the latency budget.
- Diversity and fairness genuinely shape the slate (invariants 2 and 4).
- Separating relevance from novelty makes discovery modes expressible.

### Negative

- Four stages = four places to monitor, tune, and that can regress.
- A great candidate can be cut by stage 1's cheap scorer before the good ranker
  ever sees it (recall/precision tradeoff at each cut).

### Neutral / open questions

- Stage cut sizes (5k→500→200→80→N) are starting points, tuned per surface.

## Implementation notes

- Stages 1–2 + the Rust cross-encoder live in `ranking-service`;
  `recommendation-service` orchestrates the funnel.
- Every served item carries its full score breakdown for replay + "why this".
- See [docs/recommendation/ranking-system.md](../recommendation/ranking-system.md).
