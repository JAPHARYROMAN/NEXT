# @next/admin

Internal operations console. Not user-facing; access restricted to staff via SSO + WebAuthn step-up.

## Architecture
- **Framework**: Next.js 15 (Node runtime; no Edge — these are privileged actions).
- **Routing**: domain segments — `/moderation`, `/users`, `/payments`, `/flags`, `/ops`.
- **State**: server actions for mutations; TanStack Query for live lists.
- **API**: same federated GraphQL gateway as web, but with the staff-tier JWT.
- **Audit**: every privileged action posts to `audit.privileged.action.v1` before responding.
- **Rendering**: SSR Node; no caching of personal data.

## Run

```bash
pnpm --filter @next/admin dev
```

Open <http://localhost:3010>.
