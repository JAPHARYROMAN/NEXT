# profile-service

User identity, settings, social graph (follow / mute / block).

Owner: `@next-ecosystem/identity`.

## Public API (GraphQL subgraph)
- `Me`, `User`, `Creator` types.
- `follow(userId)`, `unfollow(userId)`, `mute(userId)`, `block(userId)` mutations.
- `socialGraph(userId)` query (paginated edges).

## Internal gRPC
- `ProfileService.Get(userId) → Profile`
- `ProfileService.Update(userId, patch) → Profile`
- `SocialGraphService.Followers(userId, page) → Connection`
- `SocialGraphService.Following(userId, page) → Connection`

## Events emitted
- `profile.user.created.v1` · `profile.user.updated.v1` · `profile.user.deleted.v1`
- `profile.follow.created.v1` · `profile.follow.deleted.v1`

Partition key: `user_id`.

## Data
- `users`, `profiles`, `settings`, `follows`, `mutes`, `blocks` in `profile_pg`.
- Hot follower count cache in `profile_redis`.

## SLO
- `Get profile P95 < 50 ms` · `Follow write P95 < 100 ms` · `availability > 99.95 %`.

[Runbook](../../docs/runbooks/profile-service.md).
