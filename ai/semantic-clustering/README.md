# semantic-clustering

Aesthetic + topic clustering over the content embedding space. Produces the
cluster taxonomy that anti-homogenization reasons about.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- Clustering content embeddings into topic and **aesthetic** clusters — the
  axes the diversity reranker spreads a slate across (ADR 0031).
- Trend detection: identifying viral templates so `discovery-service` can apply
  the anti-clone penalty (the trend origin survives; the 500th clone does not).
- Cluster drift tracking: clusters split, merge, and emerge as culture moves.

## Pipeline

1. Nightly Ray Data job clusters the content embedding space (HDBSCAN-style).
2. Aesthetic-cluster ids are written back to `media-metadata-service`.
3. Emerging clusters are flagged for `discovery-service` niche surfacing.

## Doctrine

- Clusters are descriptive, not prescriptive — they exist so the feed can be
  measured for homogenization and deliberately diversified, never to bucket
  users into a fixed taste.

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/fairness-systems.md](../../docs/recommendation/fairness-systems.md).
