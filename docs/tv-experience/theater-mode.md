# Theater Mode

Theater mode is full-screen, ambient playback optimized for couch viewing distance.

## Components (`@next/theater-ui`)

- `TheaterPlayer` — wraps `CinematicPlayer` with theater layout, ambient gradient, overlays
- `TheaterControls` — remote-friendly toolbar (large hit targets)
- `ChapterNav` — D-pad chapter list
- `MetadataOverlay` / `SocialTheaterOverlay` — toggled via `useTvSessionStore.playbackOverlay`
- `AmbientTheaterOverlay` — slow background drift (respects reduced motion)

## Player extension (`@next/player-ui`)

`TheaterModePlayer` scales typography and safe zones via `couchDistance`: `near` | `standard` | `far`.

## Interaction model

- Arrow keys simulate remote LRUD in development
- `Escape` / `Backspace` → back
- `Space` → play/pause
- Controls auto-hide after idle (inherits player store behavior)

## A11y

- Large text at `tv:` breakpoint
- High-contrast focus rings via `focusRingVariants`
- `aria-label` on overlays and toolbars
