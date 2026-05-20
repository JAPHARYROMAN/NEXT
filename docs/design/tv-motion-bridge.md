# TV Motion Bridge

TV and theater surfaces share motion tokens from `@next/animation-system`.

| Variant                   | Use                      |
| ------------------------- | ------------------------ |
| `tvShelfVariants`         | Horizontal shelf enter   |
| `theaterAmbientVariants`  | Background ambient drift |
| `focusRingVariants`       | Remote focus pulse       |
| `discoveryRevealVariants` | Hero reveal              |
| `chaosDriftVariants`      | Chaos TV cards           |

## Timing

- Prefer `durations.cinematic` / `easings.cinematic`
- Always wrap with `motionSafe(…, useReducedMotion())`

## Telemetry

- `trackAnimationPerf` for heavy surfaces (optional)
- `trackTvRenderPerf` on theater home mount

Cross-reference: [mobile-motion-bridge.md](./mobile-motion-bridge.md), [watch-motion-bridge.md](./watch-motion-bridge.md).
