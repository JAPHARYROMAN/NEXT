# interest-graph

The evolving interest graph: graph construction, embedding, and decay. Models
what a user is interested in — and, by design, lets that change.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- Constructing the interest graph (interests, creators, communities, aesthetic
  clusters as nodes; weighted affinity edges) from the interaction streams.
- Random-walk node embeddings so graph-adjacent interests are vector-adjacent.
- The decay job: affinity edges lose weight on a 21-day half-life (ADR 0032).
- Taste-shift detection: a sustained behavioral change earns a learning-rate
  boost so reinvention is not a weeks-long fight against history.

## Pipeline

1. Nightly Ray Data job folds the day's interactions into the Neo4j graph.
2. Decay is applied; node embeddings are recomputed.
3. Exploration edges to non-adjacent clusters are preserved — the graph can
   never collapse to a single region.

## Doctrine

- No hard lock-in. A user is never permanently defined by their past (ADR 0032).

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/fairness-systems.md](../../docs/recommendation/fairness-systems.md).
