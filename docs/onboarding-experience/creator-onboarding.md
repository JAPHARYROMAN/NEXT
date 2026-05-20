# Creator onboarding

Routes:

- Web: `/creator/onboarding`
- Studio: `/onboarding`, `/creator-setup`

Package: `@next/onboarding-ui`

## Steps

Identity → categories → audience → monetization (optional) → studio activation → verification (optional) → first upload CTA.

## Studio

- `/onboarding` — studio module activation shell
- `/creator-setup` — checklist, audience tips, dashboard preview

## State

`useCreatorOnboardingStore` — persisted creator draft.

## Telemetry

`creator_activation`, `onboarding_step` (prefixed `creator_`)
