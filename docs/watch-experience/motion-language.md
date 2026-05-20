# Motion Language (Watch & Feed)

## Variants

| Variant                | Use                       |
| ---------------------- | ------------------------- |
| `feedItemVariants`     | Feed card enter           |
| `playerVariants`       | Mini/theater transitions  |
| `overlayVariants`      | Controls, scrubber chrome |
| `fullscreenVariants`   | Fullscreen enter/exit     |
| `scrollRevealVariants` | Chaos cards, discovery    |
| `panelVariants`        | Discovery waves           |

## Reduced motion

- `useReducedMotion` disables duration and parallax
- `motionSafe()` zeroes variant motion when reduced

## Performance

- `will-change` avoided; opacity/transform only
- Scroll handlers passive + throttled telemetry

See also `docs/design/motion-system.md`.
