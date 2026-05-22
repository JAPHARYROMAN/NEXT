# discovery-service

Explore + chaos surfaces. Owns the non-personalized-first discovery experiences: trending, niche emergence, controlled serendipity, and the explore feed where curiosity outranks confidence.

Owner: `@next-ecosystem/discovery`.

## Public API (GraphQL subgraph)

- `explore(input)` — the explore surface; high-appetite, diversity-forward.
- `trending(scope)` — velocity-ranked, regionally scoped.

## Internal gRPC

- `DiscoveryService.Explore(user_id, scope) → Slate`
- `DiscoveryService.Trending(scope, window) → []TrendingItem`
- `DiscoveryService.NicheEmergence(scope) → []EmergingItem` — quality content with low exposure that is gaining velocity.

## Events

**Emitted**: `rec.exploration.injected.v1`.
**Consumed**: `media.video.published.v1`, `playback.completed.v1`, `rec.feed.generated.v1`.

Partition key: `scope` (region / locale).

## Strategy

- Trending uses a velocity score with an anti-clone penalty so a viral template's 500th copy does not crowd out its origin.
- Niche emergence deliberately surfaces creators below the popularity median who are accelerating — the on-ramp behind the long-tail invariant (ADR 0031).
- Chaos surfaces sample along the user's exploration vector (ADR 0032).

## SLO

- `Explore P95 < 180 ms` · `Trending freshness P95 < 60 s`.

[Runbook](../../docs/runbooks/discovery-service.md) · [Architecture](../../docs/recommendation/architecture.md).
