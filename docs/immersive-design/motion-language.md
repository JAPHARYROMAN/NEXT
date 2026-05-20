# Immersive Motion Language

Phase 22 motion lives in `@next/ambient-motion` and extends `@next/animation-system`.

## Variants

| Variant                      | Use                             |
| ---------------------------- | ------------------------------- |
| `depthEnterVariants`         | Spatial panel enter             |
| `ambientDriftVariants`       | Background drift                |
| `parallaxLayerVariants`      | Subtle translate parallax       |
| `focusEmergeVariants`        | Focus chrome                    |
| `audioPulseVariants`         | Playback atmosphere placeholder |
| `spatialPanelVariants`       | animation-system re-export      |
| `environmentalDriftVariants` | Shared environmental motion     |
| `immersiveChromeVariants`    | Chrome show/hide                |

## Rules

- Always use `useAmbientMotion` / `motionSafe` with reduced motion
- No hyperactive 3D; translate and opacity only for parallax
- Prefer `durations.cinematic` for environmental transitions

## Telemetry

- `trackMotionSmoothness`
- `trackImmersiveRenderPerf`
- `trackSpatialFocusTransition`

Cross-reference: [../design/motion-system.md](../design/motion-system.md).
