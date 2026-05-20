# Mobile Player

## Packages

- `@next/player-ui` — `TouchScrubber`, `MobileImmersivePlayer`, extended `GestureLayer`
- `@next/mobile-ui` — `MobilePlayerShell` (mini → fullscreen, scrubbing, nav hide)

## Gestures

- Tap — show controls (`trackPlaybackResponsiveness`)
- Double-tap — play/pause
- Horizontal scrub on `TouchScrubber` — updates `usePlayerStore.currentTimeSec`

## Fullscreen

Entering fullscreen sets `useMobileNavigationStore` to `fullscreen` so bottom nav animates out (`fullscreenVariants`).

## Continuity

Watch routes update `useContinuityStore.resume` for cross-device resume shells.
