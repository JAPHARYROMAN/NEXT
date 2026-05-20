# Onboarding motion bridge

Connects Phase 29 onboarding to the NEXT motion system.

## Patterns

- **Page transitions**: `PageTransition` per step `routeKey` — fade only, no bounce
- **Welcome hero**: `panelVariants` + `motionSafe` when reduced motion off
- **Progress**: CSS width transition on step bar — no gamified confetti

## Reduced motion

All flows respect `useReducedMotion()` from `@next/animation-system`.

## Avoid

- Countdown timers
- Streak animations
- Forced celebration on step complete

## Layout

`OnboardingLayout` from `@next/layout-engine` — single column mobile, aside preview on `lg+`.
