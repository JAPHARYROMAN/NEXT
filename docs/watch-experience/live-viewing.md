# Live Viewing

## Route

- `/live` — default stream
- `/live/[id]` — stream selector

## Composition

- `CinematicPlayer` in `live` kind
- `SplitView` 70/30: stage + chat/reactions
- `DiscussionShell`, `AmbientReactions`
- Live clip grid (placeholder cards)

## Placeholders

- Viewer counts and chat from `demo-live.ts`
- No WebRTC or HLS until media infra is wired
