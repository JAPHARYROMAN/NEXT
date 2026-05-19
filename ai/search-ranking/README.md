# search-ranking

Learning-to-rank model for `search-service`. Re-ranks the union of BM25 + vector recall.

Owner: `@next-ecosystem/ml-discovery`.

## Architecture
- Pointwise + pairwise loss; LambdaMART baseline; transformer cross-encoder (canary).
- Features: text relevance scores, vector similarity, freshness, creator reputation, query-content embeddings.

## Serving
- Triton; ~5 ms P95 over batches of 100 candidates.
- Called by `search-service` on every search request.

## Training
- Logs queries + clicks + dwell from analytics-service via the `analytics.search.query.executed.v1` stream.
- Weekly retrain; daily incremental fine-tune.

See [MODEL_CARD.md](MODEL_CARD.md).
