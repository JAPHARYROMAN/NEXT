# 0032. Interest graph with affinity decay — no hard lock-in

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/discovery
- **Tags**: recommendation, personalization, culture

## Context

Personalization needs a model of what a user is interested in. A static tag list
or an ever-accumulating profile has a corrosive property: it makes the user's
past permanent. Last year's binge defines this year's feed; a person who has
changed spends weeks fighting their own history. That is lock-in, and it kills
reinvention and curiosity.

## Decision

Personalization is an **interest graph** — nodes are interests, creators,
communities, aesthetic clusters; edges are weighted affinities — and **edge
weights decay on a half-life** (default 21 days). Properties:

- An interest the user stops engaging with fades out of the graph.
- The graph always retains **exploration edges** to non-adjacent clusters; a
  user is never graph-isolated into a single region.
- A detected sustained taste shift applies a learning-rate boost, so a changed
  user re-weights faster than passive decay alone would allow.
- Each user carries an **exploration vector** pointing away from their centroid,
  which the serendipity candidate source samples along.

## Alternatives considered

- **Static interest tags** — simple, legible, but permanently anchoring.
  Rejected.
- **Cumulative profile, no decay** — maximizes "accuracy" to history; that is
  exactly the lock-in we are rejecting. Rejected.
- **Full session-only personalization (no long-term model)** — no lock-in, but
  also no memory; loses the slow taste vector that makes recommendations feel
  like _yours_. Rejected.

## Consequences

### Positive

- Interests reflect the present; reinvention is supported (invariant 3).
- Exploration is structural — the graph cannot collapse to a point.
- The decay half-life is a single, legible knob for "how much past matters".

### Negative

- Decay means the system "forgets" — a dormant-then-returning interest must be
  re-learned. Accepted; mitigated by the taste-shift learning-rate boost.
- A graph is heavier to store and query than a tag list (Neo4j, shared with
  ADR 0023's identity graph cluster).

### Neutral / open questions

- The 21-day half-life is a starting value; it may need to differ by interest
  type (a music taste vs. a one-off event interest decay differently).

## Implementation notes

- The interest graph lives in Neo4j, embedded nightly for candidate generation.
- Decay is applied as a scheduled job + on-read time-discount.
- `personalization-service` owns the graph; `creator-affinity` and
  `interest-graph` AI subsystems train its embeddings.
- See [docs/recommendation/fairness-systems.md](../recommendation/fairness-systems.md).
