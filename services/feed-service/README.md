# feed-service

Personalized timeline assembly. Combines `recommendation-service` candidates with social-graph signals; materializes a per-user feed in Redis.

Owner: `@next-ecosystem/feed`.

## Public API (GraphQL subgraph)
- `feed(input)` — paginated, cursor-based personalized feed.
- `feedImpression(input)`, `feedInteraction(input)` mutations (instrumentation).

## Internal gRPC
- `FeedService.Get(user_id, page) → Connection<FeedItem>`
- `FeedService.Invalidate(user_id, reason)`

## Events
**Emitted**: `feed.impression.v1`, `feed.interaction.v1`.
**Consumed**: `profile.follow.created.v1`, `profile.follow.deleted.v1`, `media.video.published.v1`, `media.video.deleted.v1`, `rec.ranking.completed.v1`.

Partition key: `user_id`.

## Data
- Per-user materialized timeline in `feed_redis` (sorted set of `video_id` ⇒ score).
- Hot creator fanout cache.
- No SQL store — feed is reconstructable from events.

## Strategy
- **Pull at request** for inactive users (last visit > 24 h).
- **Push on publish** for engaged followers of hot creators (fanout-on-write).
- Hybrid: pull + merge of push deltas.

## SLO
- `Feed first page P75 < 200 ms` · `Invalidation lag P95 < 5 s`.

[Runbook](../../docs/runbooks/feed-service.md).
