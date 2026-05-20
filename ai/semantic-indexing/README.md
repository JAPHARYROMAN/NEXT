# semantic-indexing

Video embedding + index population. Computes multimodal embeddings for published videos and writes them to Qdrant (ADR 0005), powering semantic search and recommendation recall.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.published.v1`)

1. **Gather inputs** — keyframes, transcript, tags from `multimodal-tagging`.
2. **Encode** — multimodal encoder → a single dense video embedding + per-scene embeddings.
3. **Upsert** — write vectors + payload to Qdrant via `vector-pipelines`.
4. **Persist** — emit `media.semantic.indexed.v1`; consumed by `media-search-service`.

## Doctrine

- Embeddings are derived, not authoritative — fully rebuildable by replaying publish events.
- Versioned index: an embedding-model bump writes a new collection, then atomically swaps.

## SLO

- Publish → searchable P95 < 30 s.
- Recall@10 > 0.8 on the internal semantic-retrieval eval set.

See [MODEL_CARD.md](MODEL_CARD.md).
