# Component architecture

## Layers

1. **`@next/design-system`** — tokens, themes, motion metadata, breakpoints, a11y helpers. No React runtime requirement for most modules.
2. **`@next/theme-system`** — client adaptive theme hook + document paint helpers.
3. **`@next/animation-system`** — Framer Motion primitives shared across apps.
4. **`@next/layout-engine`** — responsive shells (`AdaptiveLayout`, `GridZone`) and breakpoint hooks.
5. **`@next/icons`** — accessible SVG icons.
6. **`@next/frontend-utils`** — Zustand stores (auth, feed, player, …), TanStack Query factory, telemetry sink.
7. **`@next/ui`** — production web components (`Button`, `Modal`, `AppNav`, `MediaCard`, `PlayerShell`, `Avatar`, `Badge`, `CreatorCard`, `CommunityCard`, `MobileNav`, `SkipLink`, `Toast`, …) composed from the layers above.

## App composition

- **Route groups** in `apps/web` separate `(public)` marketing/auth flows from `(app)` authenticated shells.
- **Feature folders** (`features/*`) own vertical slices (feed, player, auth gate).
- **Layouts** (`layouts/*`) stitch navigation, sidebars, and player chrome without importing backend services directly.

## Conventions

- Prefer **server components** for static shells; mark interactive leaves with `'use client'`.
- Cross-app UI lives in `@next/ui`; avoid duplicating primitives inside individual apps unless the surface is truly unique.
