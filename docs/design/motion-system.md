# Motion system

Motion in NEXT is **ambient infrastructure**: page transitions, feed reveals, and modal presence use Framer Motion with explicit reduced-motion handling.

## Packages

- `@next/animation-system` — shared variants (`fadeVariants`, `feedItemVariants`, `modalVariants`, `drawerVariants`), `motionSafe()` helper, `PageTransition`, and `useReducedMotion`.
- `@next/design-system` — duration and easing tokens (`durations`, `easings`) consumed by variants.

## Rules

- Default transitions use **cinematic easing** (`cubic-bezier(0.16, 1, 0.3, 1)`) with 320–520ms durations for spatial changes.
- When `prefers-reduced-motion: reduce` is active, variants collapse to instantaneous or opacity-only updates via `motionSafe`.
- Avoid elastic overshoot, looping attention animations, and micro-bounces that read as manipulation.

## App integration

`apps/web` wraps authenticated and public subtree transitions with `PageTransition` keyed by pathname (`src/transitions/route-transition.tsx`).
