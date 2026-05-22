# TV Experience Architecture

Phase 21 introduces a **lean-back cinematic layer** distinct from mobile and desktop web. It is not a stretched phone UI or a streaming-grid clone.

## Surfaces

| Surface      | Route                                   | Package                                |
| ------------ | --------------------------------------- | -------------------------------------- |
| Theater home | `/tv`, `/theater`                       | `@next/tv-ui`                          |
| Playback     | `/tv/watch/[id]`, `/theater/watch/[id]` | `@next/theater-ui` + `@next/player-ui` |
| Discovery    | `/tv/discover`                          | `@next/tv-ui` + `@next/discovery-ui`   |
| Watch party  | `/tv/party/[id]`                        | `@next/tv-ui`                          |
| Live events  | `/tv/live/[id]`                         | `@next/tv-ui`                          |
| Chaos TV     | `/tv/chaos`                             | `@next/tv-ui`                          |

## Layering

```
Experience (apps/web, apps/tv)
  → tv-ui / theater-ui
  → remote-navigation (D-pad focus)
  → layout-engine (TvLayout, TheaterLayout)
  → player-ui, discovery-ui, community-ui
  → frontend-utils (tv stores + telemetry)
```

## State

- `useTvNavigationStore` — surface, shelf focus memory, overlay gate
- `useTvSessionStore` — continue-watching, shelf scroll, playback overlay, party presence, live event
- Extends existing `usePlayerStore`, `useWatchPartyStore`

## Targets

- **Web TV**: Next.js routes under `apps/web/src/app/tv` and `theater`
- **Platform TV**: Vite shell `apps/tv` for Tizen / WebOS / browser-on-TV

## Constitution alignment

Discovery supports **precision** (continue watching, semantic topics), **expansion** (waves, constellations), and **chaos** (Chaos TV) without engagement hacking.
