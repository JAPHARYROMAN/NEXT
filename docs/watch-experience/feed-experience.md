# Feed Experience

## Package: `@next/feed-ui`

- **AdaptiveFeed** — mode tabs + cinematic grid
- **FeedTypeTabs** — precision, discovery, chaos, creator, live
- **CinematicFeedItem** — scroll-linked reveal via `useScrollMotion`

## Philosophy

Calm scrolling without infinite addiction loops. Density adapts by mode (e.g. chaos → immersive).

## State: `useFeedStore`

- `mode`, `density`, `items`, `cursor`

## Telemetry

- `trackFeedLatency` on mode change
- `trackScrollPerf` on scroll (throttled)

## Routes

- `/feed`, `/home` (same cinematic feed shell)
