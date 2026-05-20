# Studio Motion System (Phase 9 extensions)

Built on `@next/animation-system` + `@next/design-system` motion tokens.

## Primitives

| Export                                   | Purpose                                   |
| ---------------------------------------- | ----------------------------------------- |
| `PageTransition`                         | Route-level enter/exit with `routeKey`    |
| `PanelTransition`                        | Dashboard widget stagger                  |
| `useScrollMotion`                        | Scroll-linked progress (0–1) for parallax |
| `panelVariants` / `scrollRevealVariants` | Framer Motion variants                    |
| `motionSafe`                             | Reduced-motion no-op variants             |

## Performance

- GPU-friendly transforms (opacity, translateY)
- `useReducedMotion` respects `prefers-reduced-motion`
- `trackAnimationPerf` placeholder for render timing telemetry

## Usage in Studio

- `StudioShell` — page transitions per pathname
- `UploadFlow` — step transitions via `PageTransition`
- Charts — bar height animation with reduced-motion instant state
