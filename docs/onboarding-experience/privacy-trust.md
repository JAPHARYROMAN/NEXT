# Privacy & trust

Routes: `/privacy`, `/account/setup` · Package: `@next/privacy-ui`

## Surfaces

- Privacy cards (data export, personalization transparency, watch history, ads policy)
- Consent preferences (personalization, analytics, marketing — analytics off by default)
- Account safety shell (sessions, 2FA placeholders)

## Tone

Calm, human-readable — not legalistic walls.

## Telemetry

`privacy_interaction` via `@next/frontend-utils` `track()`

## State

`usePrivacyStore` — `next-privacy-v1`
