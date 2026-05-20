# Layout engine

`@next/layout-engine` provides adaptive layout primitives tuned for **mobile → tablet → desktop → ultrawide**.

## API

- `useBreakpoint()` — client hook returning the active breakpoint key (`sm` … `ultrawide`).
- `AdaptiveLayout` — optional sidebar, main column, optional right rail, optional top player strip. Sidebars collapse on compact breakpoints.
- `GridZone` — responsive CSS grid helper for feed-like densities.
- `minWidth()` — helper for constructing media-query strings from design-system breakpoints.

## Breakpoints

Canonical pixel widths live in `@next/design-system` `breakpoints` to avoid drift between Tailwind config and runtime logic.

## Performance

`AdaptiveLayout` is a client component because it depends on viewport width. Keep heavy data fetching in parents or RSC wrappers to preserve streaming characteristics.
