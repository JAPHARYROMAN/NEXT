# search-service

Search across videos, creators, communities, posts. Hybrid: OpenSearch BM25 + Qdrant vector recall + a learning-to-rank reranker.

Owner: `@next-ecosystem/discovery`.

## Public API (GraphQL subgraph)
- `search(query, filters, page) → SearchConnection`
- `suggest(prefix) → string[]` (typeahead).

## Internal gRPC
- `SearchService.Query(input) → SearchResults`
- `IndexService.Upsert(doc)` / `Delete(id)` — used by consumers.

## Events
**Consumed**: `media.video.published.v1`, `media.video.deleted.v1`, `profile.user.updated.v1`, `community.community.created.v1`, `community.post.created.v1`.
**Emitted**: `search.query.executed.v1`.

## Data
- Primary index: OpenSearch (`videos`, `creators`, `communities`, `posts`).
- Vector recall: Qdrant.
- Cached top queries in `search_redis`.

## SLO
- `Query P95 < 200 ms` · `Suggest P95 < 30 ms` · `Index lag P95 < 30 s` (event → searchable).

[Runbook](../../docs/runbooks/search-service.md).
