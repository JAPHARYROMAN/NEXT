# @next/account-center

Authenticated surface for managing your NEXT identity. The "Settings" of NEXT, lifted to a first-class product.

Owner: `@next-ecosystem/identity`. Status: **scaffolded** — real flows in Phase 7.

## Architecture

- **Framework**: Next.js 15 App Router. Mostly client-rendered (interactive forms + lists).
- **API**: federated GraphQL via the gateway. Uses the `me`, `mySessions`, `myDevices`, `myTrustScore` queries.
- **Auth**: requires a valid JWT. Sensitive views (`/security`, `/personalization`) require step-up via `notification-auth-service`.

## Routes

| Path               | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `/profile`         | Handle, display name, bio, avatar                                             |
| `/security`        | Passkeys, password, recovery codes, audit log of credential events            |
| `/sessions`        | Active sessions across devices — revoke any                                   |
| `/devices`         | Trusted devices — revoke / rename                                             |
| `/personalization` | View + reset the user's personalization vector (constitution: humane default) |
| `/audit`           | Full audit log of the user's privileged actions                               |
| `/connections`     | Third-party apps with access; revoke OAuth grants                             |
| `/notifications`   | Per-channel notification preferences                                          |
| `/privacy`         | Data export, deletion request                                                 |

## Design

Same tokens as `apps/web`. Calm, dense-but-readable, no growth-hacky patterns.
