# Ambient Interfaces

`@next/environment-ui` implements low-attention environmental UI.

## Surfaces

- `AmbientEnvironment` — mood + variant wrapper
- `ContextualOverlay` — focus-transition overlay
- `CalmSurface` — intelligence snippets
- `PlaybackAtmosphere` — audio-reactive **placeholder** (CSS/motion only)
- `EmotionAdaptiveBg` — theme-system gradient lighting

## Behavior

1. Overlays hidden by default (`useEnvironmentStore.overlayVisible`)
2. Low-distraction mode via `useImmersiveStore.lowDistraction`
3. Reduced motion respected through `@next/ambient-motion`

## Route

Web: `/ambient`

Cross-reference: [cinematic-environments.md](./cinematic-environments.md).
