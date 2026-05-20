# Social discovery

Community discovery is available at `/communities` and `/communities/discover` (social route group).

## UI

- `CommunityDiscoveryGrid` — calm cards linking to `/community/[slug]`
- `EmergingCommunityCard` — niche / underground highlights
- `CulturalWave` — interest wave selector (controlled chaos)
- `CreatorConstellation` — reused from `@next/discovery-ui`

## Filters

`useCommunityFilterStore` drives `all | joined | emerging | underground` tabs. Filter changes emit `trackDiscoveryEngagement`.

## Demo data

`apps/web/src/lib/demo-communities.ts` supplies slugs: `quiet-signals`, `chaos-hour`, `learn-forward`.

## Philosophy

Discovery optimizes for cultural emergence and small-creator visibility — not addiction or rage engagement (NEXT constitution §8).
