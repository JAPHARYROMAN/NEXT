# Community experience architecture

Phase 14 introduces the social/community experience layer for NEXT web — UI-only, contract-ready placeholders.

## Layers

| Layer        | Package / app            | Responsibility                                              |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| Identity     | `@next/community-ui`     | Headers, presence, rituals, join flow                       |
| Social       | `@next/social-ui`        | Threads, watch parties, discovery grids                     |
| Trust        | `@next/reputation-ui`    | Badges, health, moderation transparency                     |
| Live overlay | `@next/live-ui`          | Chat, polls, callouts, moderation banners                   |
| Layout       | `@next/layout-engine`    | `CommunityRoom`, `WatchPartyLayout`                         |
| Motion       | `@next/animation-system` | `presenceVariants`, `roomEntryVariants`, `reactionVariants` |
| State        | `@next/frontend-utils`   | Filters, composer, watch party, onboarding stores           |
| App          | `apps/web`               | Routes, demo data, feature shells                           |

## Routes

- `/communities` — social discovery
- `/community/[slug]` — community home
- `/creator/[handle]/community` — creator community space
- `/watch-party`, `/watch-party/[id]` — watch party lobby and room
- `/communities/discover` — `(social)` group alias

## Principles

- Chronological, calm discussions — no rage-ranked walls
- Creator-centered circles with rituals and premium shells (API pending)
- Controlled chaos via cultural waves and emerging community cards
- Telemetry for discussion latency, watch party joins, reaction perf, discovery engagement

## Backend boundary

No changes to `community-service`, events, or moderation algorithms in this phase. Surfaces emit telemetry and accept future GraphQL/gRPC contracts.
