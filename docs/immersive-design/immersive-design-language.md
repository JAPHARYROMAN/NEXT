# Immersive Design Language

Phase 22 extends `@next/design-system` with spatial tokens and `@next/immersive-ui` for ambient, cinematic surfaces.

## Principles

- **Calm intelligence** — UI appears when needed, never shouts
- **Physically believable depth** — scale and shadow, not hologram clichés
- **Progressive enhancement** — spatial layers optional; standard web works without them

## Tokens

| Token family   | Package       | Use                        |
| -------------- | ------------- | -------------------------- |
| `depthLayers`  | design-system | Z-index semantic stacking  |
| `spatialScale` | design-system | Near/mid/far scale tiers   |
| `ambientLight` | design-system | Adaptive lighting variants |
| `depthShadows` | design-system | Cinematic elevation        |

## Components

- `ImmersiveShell` — mode-aware ambient wrapper
- `CinematicDepth` — tiered scale + shadow
- `FocusAwareChrome` — focus-region chrome emergence
- `DiscoveryRoom` / `WatchEnvironment` — composed layouts

## State

`useImmersiveStore`, `useFocusLayoutStore` in `@next/frontend-utils`.

Cross-reference: [motion-language.md](./motion-language.md), [ambient-interfaces.md](./ambient-interfaces.md).
