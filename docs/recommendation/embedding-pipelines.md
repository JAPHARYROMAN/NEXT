# Embedding Pipelines

Recommendation runs on six embedding spaces. All are versioned, all are
rebuildable from events, none are authoritative source-of-truth — they are
_derived_.

## The six spaces

| Space          | Dim | Cadence    | Source                                                          |
| -------------- | --- | ---------- | --------------------------------------------------------------- |
| content        | 768 | on publish | `semantic-indexing` (media AI) — fused vision/audio/text        |
| creator        | 768 | nightly    | aggregate of the creator's content embeddings + style signature |
| community      | 768 | nightly    | aggregate of community content + interaction culture            |
| user (slow)    | 256 | hourly     | EWMA of engaged-content embeddings; the taste centroid          |
| session (fast) | 256 | per event  | sequence model over the current session's events                |
| interest       | 128 | nightly    | node2vec-style embeddings of the interest graph                 |

`user` and `session` are smaller on purpose — they are queried on the hot path
and blended at request time: `query = α·user + (1−α)·session`, where `α` falls
as the session lengthens (early in a session, you are who you were; later, you
are what you're doing).

## Pipelines

### Content embedding (online-triggered)

`media.video.published.v1` → `embedding-pipelines` Ray job → Triton inference →
Qdrant upsert into the `content` collection → `media.semantic.indexed.v1`.
Latency target: publish → searchable P95 < 30 s.

### Creator / community embedding (batch)

Nightly Ray Data job aggregates member content embeddings, computes a style
signature (variance + dominant clusters), upserts to Qdrant.

### User / session embedding

- **user**: hourly batch job folds the last window of engagements into the EWMA
  vector. Stored in the Redis feature store + Qdrant.
- **session**: a sequence model (`feed-intelligence`) updates the session vector
  on every playback / skip / search event, in-process in `personalization-service`.

### Interest-graph embedding

Nightly: the interest graph (Neo4j) is embedded with a random-walk method so
graph-adjacent interests are vector-adjacent. Feeds the candidate-generation
"adjacent interest" source.

## Versioning & drift

Every embedding space has a `model_version`. A version bump writes a **new
Qdrant collection** and runs dual-read until parity is confirmed, then atomically
swaps the alias. Recommendation never queries a half-migrated collection.

**Drift monitoring**: the distribution of content embeddings is sampled daily;
a population-stability-index breach alerts the ML team. User-vector drift is
expected (people change); content-space drift usually means an upstream model
changed and is a signal to retrain rankers.

## Retrieval

Semantic recall (`semantic-retrieval-service`) queries Qdrant with HNSW, scoped
by filters (region, language, safety, freshness window). The vector DB choice
and operating model are ADR 0005.

Temporal weighting is applied post-recall: a candidate's score is multiplied by a
recency kernel so that the same embedding distance means "less" for stale
content — without removing the long tail (the kernel has a floor).

## Rebuildability

Every space can be rebuilt by replaying events: content from
`media.video.published.v1`, user/session/interest from the playback and
interaction streams. There is no embedding that, if lost, cannot be regenerated.
This is what makes the vector DB a cache, not a database of record.
