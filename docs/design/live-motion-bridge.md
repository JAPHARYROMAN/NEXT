# Live Motion Bridge

Live surfaces share motion tokens from `@next/animation-system`.

| Variant            | Use                          |
| ------------------ | ---------------------------- |
| `presenceVariants` | Audience pulse, activity bar |
| `overlayVariants`  | Countdown hero, live banners |
| `panelVariants`    | Chat/moderation panel enter  |

## Timing

- Prefer `durations.calm` / `easings.cinematic`
- Always wrap with `motionSafe(…, useReducedMotion())`

## Telemetry

- `trackLiveViewingEngagement`
- `trackMotionSmoothness` for heavy live overlays (optional)

Cross-reference: [watch-motion-bridge.md](./watch-motion-bridge.md), [tv-motion-bridge.md](./tv-motion-bridge.md).
