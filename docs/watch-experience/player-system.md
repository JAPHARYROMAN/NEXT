# Player System

## Package: `@next/player-ui`

| Component         | Role                                  |
| ----------------- | ------------------------------------- |
| `CinematicPlayer` | Theater/fullscreen/mini orchestration |
| `PlayerControls`  | Auto-hiding toolbar, keyboard targets |
| `GestureLayer`    | Tap/double-tap with telemetry         |
| `SubtitlesShell`  | Caption region (ARIA live)            |
| `MiniPlayer`      | Persistent mini chrome                |

## Extensions: `@next/media-ui`

- `AmbientOverlay` — GPU-friendly ambient gradient pulse
- `ChapterNav` — semantic chapter list
- `TheaterShell`, `TimelineScrubber` — shared shells

## Motion

`playerVariants`, `overlayVariants`, `fullscreenVariants` in `@next/animation-system` with `useReducedMotion` and `motionSafe`.

## Telemetry

- `trackPlaybackQoe` on session start
- `trackInteraction` on scrub, gestures, controls
