# embedding-pipelines

Embedding generation for recommendation. Computes and maintains the six
embedding spaces — content, creator, community, user, session, interest — and
keeps Qdrant in sync.

Owner: `@next-ecosystem/ml-discovery`.

## Pipelines (Ray Data)

1. **Content** — triggered by `media.video.published.v1`; fuse media-AI signals → 768-d vector → Qdrant `content`.
2. **Creator / community** — nightly aggregate of member content + style signature.
3. **User (slow)** — hourly EWMA fold of engaged-content embeddings → Redis feature store.
4. **Interest** — nightly random-walk embedding of the interest graph.

## Versioning

- Every space carries a `model_version`; a bump writes a new Qdrant collection,
  dual-reads to parity, then atomically swaps the alias.
- Population-stability-index drift monitoring; a breach alerts the ML team.

## SLO

- Publish → content embedding searchable P95 < 30 s.

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/embedding-pipelines.md](../../docs/recommendation/embedding-pipelines.md).
