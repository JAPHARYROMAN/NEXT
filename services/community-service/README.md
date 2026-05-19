# community-service

Groups, presence, posts, real-time chat (non-live). Communities = persistent groups; live chat lives in `live-service`.

Owner: `@next-ecosystem/social`.

## Public API (GraphQL subgraph)
- `Community`, `Membership`, `Post`, `Comment` types.
- Mutations: `createCommunity`, `joinCommunity`, `post`, `comment`.
- Subscriptions: `communityPresence`, `newPost`.

## Internal gRPC
- `CommunityService.Get(community_id) → Community`
- `MembershipService.Members(community_id, page) → Connection<Member>`
- `PresenceService.SetOnline(user_id, community_id)`

## Events
**Emitted**: `community.community.created.v1`, `community.post.created.v1`, `community.presence.changed.v1`.
**Consumed**: `profile.user.deleted.v1`.

## Data
- `communities`, `memberships`, `posts`, `comments` in `community_pg`.
- Presence in `community_redis` (TTL'd hash, heartbeat every 30s).

## SLO
- `Community read P95 < 80 ms` · `Post write P95 < 150 ms` · `Presence broadcast lag P99 < 1 s`.

[Runbook](../../docs/runbooks/community-service.md).
