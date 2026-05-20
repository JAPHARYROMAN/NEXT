# Search Interface

Phase 16 semantic search — cinematic, intent-led discovery surface.

## Routes

- `/search` — primary search experience (`SearchExperience`)

## Packages

- `@next/search-ui` — SearchBar, IntentModes, QueryRefinement, SearchFiltersPanel, SearchResults
- `@next/layout-engine` — SearchLayout (sidebar + main)
- `@next/frontend-utils` — `useSearchDiscoveryStore`, search telemetry

## Intent modes

| Mode        | Purpose             |
| ----------- | ------------------- |
| exact       | Precise matches     |
| explore     | Curiosity expansion |
| chaos       | Unexpected finds    |
| learn       | Craft & technique   |
| creators    | People & voices     |
| communities | Gathering spaces    |
| live        | Happening now       |

## Result layouts

Mixed, grouped, compact, immersive — controlled via `resultLayout` in store.

## State & URL

Zustand store persists recent/saved searches. URL params: `q`, `intent`, `mode`, `chaos`, `layout`, `refine`.

## Telemetry

`search_latency`, `search_result_click`, `query_refinement`, `zero_result_friction`

## Data

Mock only — `apps/web/src/lib/demo-search.ts`

## Accessibility

- `role="search"` on form
- Suggestion listbox with `aria-expanded`
- Intent tabs with `role="tablist"`
- Result sections with `aria-label`
- Reduced motion via `@next/animation-system`
