# Creator community spaces

Creator communities live at `/creator/[handle]/community` and compose `@next/social-ui` `CreatorCommunityShell`.

## Surfaces

- **Announcements** — pinned creator messages via `@next/community-ui`
- **Fan discussion** — `DiscussionThread` + `ThreadComposer`
- **Premium lounge** — shell only; billing/membership API pending
- **Media wall** — `MediaCollection` placeholder tiles
- **Q&A / Events** — dashed-border shells for future calendar/queue APIs
- **Rituals** — `RitualBanner` for scheduled moments

## Trust

`CreatorVerification` and `TrustedContributorBadge` from `@next/reputation-ui` render as static demo trust signals.

## Linking

Public creator profiles (`CinematicCreatorProfile`) link into the community route and active watch parties.
