# Creator Studio Architecture (Phase 9)

NEXT Studio is the creator-facing experience layer — immersive, calm, and cinematic rather than corporate dashboard UX.

## Surfaces

| Surface      | App route       | Primary packages                                                 |
| ------------ | --------------- | ---------------------------------------------------------------- |
| Dashboard    | `/`             | `@next/studio-components`, `@next/charts`                        |
| Upload       | `/upload`       | `@next/studio-components`, `@next/frontend-utils` (upload store) |
| Content      | `/content`      | `@next/ui`                                                       |
| Analytics    | `/analytics`    | `@next/charts`, analytics filter store                           |
| Monetization | `/monetization` | `@next/studio-components`                                        |
| Live control | `/live`         | `@next/studio-components`, live session store                    |
| Community    | `/community`    | `@next/creator-ui`                                               |

## Package boundaries

- **`@next/studio-components`** — dashboard widgets, upload zone, live health, monetization shells
- **`@next/charts`** — animated SVG charts (no spreadsheet overload)
- **`@next/creator-ui`** — cinematic headers, profile hero, community shells
- **`@next/media-ui`** — theater mode, timeline scrubber, clip preview
- **`@next/layout-engine`** — `CreatorWorkspace`, `DashboardGrid`, `SplitView`
- **`@next/animation-system`** — `PanelTransition`, `useScrollMotion`
- **`@next/theme-system`** — cinematic gradients, ambient lighting

## State

Zustand stores in `@next/frontend-utils`:

- `useUploadStore` — upload phases, chunked progress UI, metadata
- `useLiveSessionStore` — stream health, viewer count
- `useAnalyticsFilterStore` — range and analytics surface
- `useStudioWorkspaceStore` — dashboard panel selection
- `useCreatorStore` — legacy step machine (upload → publish)

TanStack Query via `StudioProviders` for future API integration.

## Data

All metrics and uploads use **mock/placeholder data**. No backend or API contract changes in Phase 9.

## Public creator profiles

`apps/web/src/app/(creator)/[handle]` — cinematic public profile using `@next/creator-ui` and `@next/media-ui`.
