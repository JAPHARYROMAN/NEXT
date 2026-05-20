# Remote Navigation

`@next/remote-navigation` provides spatial focus for 10-foot UIs.

## Primitives

| Export            | Role                                     |
| ----------------- | ---------------------------------------- |
| `FocusProvider`   | Global LRUD key handler + focus registry |
| `FocusZone`       | Isolated shelf / rail regions            |
| `Focusable`       | Large-target focusable control           |
| `RemoteShortcuts` | Back, play/pause, home mappings          |
| `pickNeighbor`    | Grid-based spatial neighbor selection    |

## Focus memory

`useTvNavigationStore.rememberFocus` / `recallFocus` persist last focus per zone when leaving a shelf.

## Telemetry

- `trackRemoteLatency` — back, play_pause, home
- `trackFocusTransition` — from/to focus ids + duration

## Design rules

- Minimum ~3.25rem hit targets
- No dense trees; shallow shelves preferred
- Cinematic transitions via `focusRingVariants` (calm scale, not jitter)
