# Gesture System

`@next/gesture-system` provides discoverable, threshold-based touch gestures — not accidental triggers.

## Primitives

| API              | Use                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| `useSwipe`       | Horizontal/vertical swipe with configurable threshold (default 48px) |
| `useLongPress`   | 500ms press with cancel on touch end                                 |
| `GestureSurface` | Horizontal swipe region for nav/back                                 |
| `SwipeFeed`      | Vertical immersive feed paging                                       |

## Telemetry

Every recognized gesture emits `trackGestureLatency(gesture, target, latencyMs)`.

## Accessibility

Gestures are additive; primary actions remain buttons/links. Respect `prefers-reduced-motion` via `@next/animation-system`.
