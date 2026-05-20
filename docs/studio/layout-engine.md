# Layout Engine (Creator workspaces)

Phase 9 extends `@next/layout-engine` for creator workstations.

## Layouts

### `CreatorWorkspace`

Sidebar nav + main + optional inspector rail. Collapses to horizontal nav on `sm`/`md`.

Used by **NEXT Studio** shell.

### `DashboardGrid`

Responsive grid: 2 / 3 / 4 columns with `auto-rows-fr` for equal-height widgets.

### `SplitView`

Primary/secondary split: `50-50`, `60-40`, `70-30` — live control room, analytics pairs.

### `AdaptiveLayout` (existing)

Player header, sidebar, main, rail — used on web creator profiles.

## Breakpoints

Inherited from `useBreakpoint` and design-system breakpoints — mobile through ultrawide.
