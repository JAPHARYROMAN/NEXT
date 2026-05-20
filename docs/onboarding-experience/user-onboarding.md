# User onboarding

Route: `/onboarding` · Package: `@next/onboarding-ui`

## Steps

1. Profile basics (display name)
2. Interest selection
3. Discovery mode (Precision / Discovery / Chaos / Balanced)
4. Language & region (optional)
5. Privacy pointer → `/account/setup` (optional)
6. Notifications (optional)
7. Feed preparation → completion

## Principles

- Optional steps skippable
- Chaos explicitly optional
- Copy states preferences are changeable later

## State

`useOnboardingStore` — persisted local draft, resumable.

## Telemetry

- `onboarding_step`, `onboarding_preference`, `onboarding_dropoff`
