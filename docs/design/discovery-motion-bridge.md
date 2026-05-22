# Discovery Motion Bridge

Motion vocabulary for Phase 16 search and discovery surfaces.

## Variants (`@next/animation-system`)

| Variant                   | Use                                      |
| ------------------------- | ---------------------------------------- |
| `searchBarVariants`       | Search input reveal                      |
| `searchResultVariants`    | Staggered result entry                   |
| `discoveryRevealVariants` | Explore shelves, trend cards             |
| `chaosDriftVariants`      | Chaos portal cards — subtle rotate/scale |
| `constellationVariants`   | Creator constellation nodes              |

## Reduced motion

All variants pass through `motionSafe()` — empty variants when `useReducedMotion()` is true.

## Layout transitions

- `SearchLayout` — sidebar collapse on mobile
- `ExploreLayout` — ultrawide wave column widening
- `MixedResultsLayout` — density modes (compact / comfortable / immersive)

## Performance

Track via `trackAnimationPerf` when profiling discovery surfaces.
