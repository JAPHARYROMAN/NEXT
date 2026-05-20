# Live Viewing

## Routes

- `/live` — default stream
- `/live/[id]` — stream by id
- `/events` — scheduled events hub
- `/events/[id]` — event detail + countdown

## Composition

- `LiveWatchLayout` — 70/30 stage + sidebar
- `CinematicPlayer` (`kind="live"`)
- `@next/realtime-ui` presence shell
- `@next/chat-ui` panel + question queue
- `@next/live-ui` status, metadata, post-live transition, replay chapters
- `@next/monetization-ui` transparent support placeholders

## State

- `useLiveRoomStore` — layout, replay flag
- `trackLiveViewingEngagement` on mount

## Placeholders

- No WebRTC/HLS — demo data in `demo-live.ts`
- Chat/moderation are contract-ready UI only
