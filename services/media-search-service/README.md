# media-search-service

Video discovery. Serves lexical + semantic search over the published catalog, blending keyword relevance with vector similarity from the `semantic-indexing` subsystem.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `searchVideos(query, filters, page)` — hybrid ranked results.
- `searchSuggest(prefix)` — typeahead.

## Internal gRPC

- `MediaSearchService.Search(query, filters, page) → Connection<Hit>`
- `MediaSearchService.Suggest(prefix) → []Suggestion`
- `MediaSearchService.Index(video_id, document)` — upsert into the search index.

## Events

**Emitted**: `media.search.indexed.v1`.
**Consumed**: `media.video.published.v1`, `media.video.deleted.v1`, `media.metadata.updated.v1`, `media.semantic.indexed.v1`.

Partition key: `video_id`.

## Data

- Lexical index in OpenSearch; vector recall via `recommendation` Qdrant (ADR 0005).
- Hybrid score = `α·BM25 + β·cosine`; α/β tuned per surface.

## SLO

- `Search P95 < 250 ms` · `Index lag P95 < 10 s after publish`.

[Runbook](../../docs/runbooks/media-search-service.md).
