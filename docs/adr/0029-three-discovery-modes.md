# 0029. Discovery as three continuous modes, not a single ranker

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/discovery
- **Tags**: recommendation, discovery, ranking

## Context

A single ranker produces a single notion of "good": it exploits what it is
confident about. On a discovery platform that is a failure mode — it converges
every feed toward the interest centroid and manufactures echo chambers. We need
the system to also _expand_ and _surprise_, and to choose between those
behaviours based on what the user is doing right now.

## Decision

Recommendation operates on a continuous **exploration-appetite** axis with three
named anchors — **Precision** (exploit), **Discovery** (expand), **Chaos**
(surprise). The mode is inferred per request from session signals (length, skip
rate, rewatches, search-entry, dwell variance, fatigue); it is **not** a
user-facing setting. The scalar drives candidate-source budgets and the
novelty weight in final reranking.

A high skip rate pushes toward Chaos (widen the aperture), not toward more of
the same — the opposite of a watch-time optimizer.

## Alternatives considered

- **Single ranker** — simplest; produces echo chambers, no structural
  exploration. Rejected.
- **Two modes (exploit/explore)** — the classic bandit framing. Too coarse:
  cannot distinguish "expand gently" from "surprise hard". Rejected.
- **User-selected mode** — a UI toggle. Most users never touch it; it offloads a
  system responsibility onto the user. Kept as a possible future signal, not the
  mechanism.

## Consequences

### Positive

- A structural guarantee of exploration; precision is capped, never total.
- Product, experimentation, and observability share a vocabulary (three anchors)
  while the runtime interpolates smoothly.
- Skips become an _expand_ signal — antidote to echo-chamber convergence.

### Negative

- Mode inference is itself a model that needs tuning, monitoring, and its own
  experiments.
- A continuous axis is harder to debug than discrete states; mode changes are
  emitted as events to compensate.

### Neutral / open questions

- The smoothing constant (EWMA) for appetite is a tuned parameter; initial value
  is a guess to be refined by experiment.

## Implementation notes

- Mode inference lives in `personalization-service`; the appetite scalar travels
  on the ranking request context.
- A `rec.discovery.mode.changed.v1` event is emitted on a material shift.
- See [docs/recommendation/discovery-modes.md](../recommendation/discovery-modes.md).
