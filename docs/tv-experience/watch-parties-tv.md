# Watch Parties on TV

Couch-social sync viewing extends Phase 14 watch-party patterns for large screens.

## Layout

`WatchPartyTv` uses `WatchPartyLayout` from `@next/layout-engine`:

- **Viewport**: `TheaterPlayer` for synced media
- **Social rail**: host, mood, participant count — not a full chat wall

## Mood

`MoodIndicator` reflects phase: `electric` while watching, `calm` during post-watch discussion.

## Presence

`useTvSessionStore.watchPartyPresence` feeds social theater overlays during playback.

## Flow

1. Entry from theater home watch-party shelf
2. Route: `/tv/party/[id]`
3. Post-watch: transition `useWatchPartyStore` phase to `discussion` (demo button on web party page)
