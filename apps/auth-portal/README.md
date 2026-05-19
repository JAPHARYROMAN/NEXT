# @next/auth-portal

The single browser surface where credentials are handled — sign-in, sign-up, recovery, device approval, third-party OAuth consent.

Owner: `@next-ecosystem/identity`. Status: **scaffolded** — real WebAuthn flows in Phase 6.

## Architecture

- **Framework**: Next.js 15 App Router. Edge runtime where it helps (sign-in lookups, anonymous landings).
- **State**: minimal. Each route is mostly server-rendered; client islands only for WebAuthn ceremony + recovery wizard.
- **Auth**: this app talks to `auth-service` directly (OAuth2 endpoints). It never sees user data beyond the credential it's verifying.
- **CSP**: strict default-src 'self'; no inline scripts; PKCE on every code flow.

## Routes

| Path               | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `/sign-in`         | Passkey-first; password fallback; magic-link option |
| `/sign-up`         | Handle + display name + passkey enroll              |
| `/recover`         | Recovery-code, email, or trusted-contact path       |
| `/oauth/authorize` | OIDC authorization endpoint (UI)                    |
| `/oauth/consent`   | Third-party app consent (Phase 7)                   |
| `/device-approval` | Push-challenge approval from a trusted device       |

## Performance

- TTFB < 100 ms target (edge runtime + minimal data fetching).
- Zero third-party scripts.
- Aggressive code-splitting; WebAuthn polyfill only loaded when needed.

## Design

Single column, calm, no platform chrome. The portal feels like a privacy moment — distinct from the rest of the product.
