# semantic-retrieval-service

Vector recall. Serves semantic-similarity queries over the content / creator /
community embedding collections in Qdrant — the recall arm that finds content
_about the same thing_ rather than content _engaged by the same people_.

Owner: `@next-ecosystem/discovery`.

## Internal gRPC

- `SemanticRetrievalService.Query(embedding, filters, k) → Match[]` — k-NN over a collection.
- `SemanticRetrievalService.Similar(content_id, k) → Match[]` — neighbors of a known item.

## Events

**Consumed**: `media.semantic.indexed.v1` (collection freshness signal).

Partition key: n/a (read-mostly, stateless query service).

## Data

- Qdrant collections: `content`, `creator`, `community` (ADR 0005); HNSW index.
- A version bump writes a new collection and dual-reads until parity, then swaps
  the alias — recommendation never queries a half-migrated collection.
- Post-recall temporal weighting: a recency kernel with a floor, so stale
  content counts for less without removing the long tail.

## Contract

- Filters scope a query by region, language, safety hold, and freshness window.
- Returns cosine distance alongside each match for downstream ranking.

## SLO

- `Query P95 < 25 ms` for k ≤ 500 · `Recall@10 > 0.8` on the retrieval eval set.

[Runbook](../../docs/runbooks/semantic-retrieval-service.md) · [Embedding pipelines](../../docs/recommendation/embedding-pipelines.md).
