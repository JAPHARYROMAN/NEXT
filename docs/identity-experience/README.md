# Identity experience bridge

Phase 29 identity surfaces connect to Phase 6 auth without backend changes.

## Packages

| Package                | Role                                                      |
| ---------------------- | --------------------------------------------------------- |
| `@next/identity-ui`    | Shell, step progress, navigation, accessible field groups |
| `@next/profile-ui`     | Profile setup, handle check placeholder, preview          |
| `@next/onboarding-ui`  | Welcome, user/creator flows, first-run, studio shells     |
| `@next/preferences-ui` | Personalization controls                                  |
| `@next/privacy-ui`     | Trust, consent, account safety                            |

## Auth integration

- Demo sign-in: `/auth` → `@next/frontend-utils` `useAuthStore`
- Onboarding routes use `(public)` layout — no token required for demo
- Production: OIDC via `@next/auth-sdk` (unchanged)

## Layout & motion

- `@next/layout-engine` `OnboardingLayout` — adaptive aside on large screens
- `@next/animation-system` `PageTransition`, `useReducedMotion` — cinematic, not celebratory

## Future

- Identity service handle availability API
- Avatar upload via media pipeline
- Consent sync to trust/privacy backend

See [IDENTITY_ARCHITECTURE.md](../IDENTITY_ARCHITECTURE.md) for system topology.
