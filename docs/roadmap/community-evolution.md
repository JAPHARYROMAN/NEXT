# Community Evolution

> How connection on NEXT evolves — from comments and follower counts, to living
> communities, to creator-owned social spaces — while keeping intimacy possible
> at planetary scale.

## 0. Principle

Community evolution chases one hard thing: **intimacy at scale**. The platforms
that came before traded intimacy away for reach — a follower count is not a
relationship, a comment section is not a community. NEXT's roadmap treats small,
healthy, human-scale connection as the thing to preserve _as_ the platform
grows, not the thing sacrificed to growth.

## 1. Current — comments & followers

Today connection is thin: follows, comments, reactions. `community-service`
exists as a scaffold; the social graph lives in identity. This is the baseline,
not the destination.

## 2. Near future (~3 years) — living communities

Communities become **persistent, living spaces** rather than comment threads.

- **Living communities** — a community has continuity: shared history, rituals,
  recurring gatherings, its own culture. It persists between any one creator's
  posts.
- **Creator-led ecosystems** — a creator's community is a space they shape and
  (per [creator-economy-evolution.md](creator-economy-evolution.md)) own —
  not a feature rented from the platform.
- **Healthy community rituals** — recurring, low-pressure formats (watch
  parties, threads, prompts) that build belonging without demanding constant
  presence.
- **Community trust & autonomy** — healthy communities earn moderation autonomy
  ([docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md)
  §2.3): community trust governs how much self-governance a community gets.

**Architectural implications**: `community-service` becomes deep — persistent
community state, membership, roles, rituals; community trust as a first-class
signal; community as a discovery surface ([discovery-evolution.md](discovery-evolution.md)).

## 3. Mid term (~5 years) — social spaces & collaborative environments

Communities become **places**, not pages.

- **Social spaces** — synchronous and asynchronous gathering places: shared
  viewing, live co-presence, persistent rooms.
- **Collaborative media environments** — communities co-create: shared projects,
  collective worlds, community-authored media ([media-evolution.md](media-evolution.md)).
- **Evolving digital identity** — a member's identity within a community
  develops over time — contributions, roles, reputation — and (per the
  portability commitment) is increasingly theirs to carry.

## 4. Long term (~10 years) — immersive gatherings

For the audiences and hardware that support it, communities extend into
**immersive gatherings** — spatial co-presence, shared immersive experiences,
community-owned immersive spaces ([immersive-computing.md](immersive-computing.md)).
As with all immersive features, this is **additive and optional** — a community
that only ever meets in text and video is fully a community on NEXT in 10 years.

## 5. Intimacy at scale — how

The phrase is easy; the mechanism is the hard part. NEXT's approach:

- **Human-scale sub-spaces** — large communities are _composed of_ small ones;
  the platform supports nested, human-scale rooms rather than one undifferentiated
  crowd. Belonging happens in the small room.
- **Ritual over feed** — recurring rituals create the repeated, low-stakes
  contact that relationships actually need — the opposite of a one-shot
  engagement spike.
- **Presence without pressure** — community participation is designed to be
  _ambient and optional_; the pacing doctrine ([docs/recommendation/fairness-systems.md](../recommendation/fairness-systems.md))
  extends here — a community must never feel like an obligation treadmill.
- **Moderation that protects the small** — community-level moderation, with
  autonomy earned through trust, keeps small spaces safe enough to be intimate.

## 6. The risks and the guards

- **Parasocial exploitation** — communities engineered to manufacture one-sided
  attachment for revenue ([anti-patterns.md](anti-patterns.md)). Guard:
  community features are designed for _mutual_ connection and member agency, not
  for maximizing a creator's extractive hold.
- **Toxic community capture** — a community sliding into harassment or
  coordinated abuse. Guard: community trust health is monitored; autonomy is
  _earned and revocable_; risk-intelligence watches for coordinated abuse
  ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)).
- **Engagement-loop creep** — community notifications becoming a compulsion
  engine. Guard: the "presence without pressure" principle is a design
  constraint, not a nice-to-have.

## 7. What becomes obsolete

- **The follower count as the unit of connection** — superseded by membership in
  living communities.
- **The comment section as the only social surface** — superseded by persistent
  social spaces.

## 8. Future ADRs implied

- A persistent-community data + membership + roles model.
- A community-owned-space ownership model.
- A community-autonomy / self-governance framework.

## Related documents

- [creator-economy-evolution.md](creator-economy-evolution.md) · [discovery-evolution.md](discovery-evolution.md) · [immersive-computing.md](immersive-computing.md) · [docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md)
