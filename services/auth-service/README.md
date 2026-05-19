# auth-service

OAuth2 + OIDC authorization server. Issues access + refresh tokens, manages sessions, rotates signing keys, brokers WebAuthn / passkey credentials.

Owner: `@next-ecosystem/identity`.

## Architecture

```
┌──────────────────────────────────────────┐
│  HTTP (OIDC discovery, /oauth/*)          │
│  gRPC (internal: SessionService)          │
└──────────────────────┬───────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │       internal/api          │
         │  oidc · oauth · webauthn    │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┴───────────────┐
         │       internal/domain         │
         │  session · credential · key   │
         └──────────────┬───────────────┘
                        │
         ┌──────────────┴───────────────┐
         │       internal/store          │
         │  pg (users, creds, sessions)  │
         │  redis (rate-limit, tokens)   │
         │  vault (signing keys)         │
         └──────────────────────────────┘
```

## Public API

- `GET /.well-known/openid-configuration`
- `GET /.well-known/jwks.json`
- `POST /oauth/token`
- `POST /oauth/revoke`
- `POST /oauth/introspect`
- `POST /webauthn/register/options`
- `POST /webauthn/register/verify`
- `POST /webauthn/login/options`
- `POST /webauthn/login/verify`

GraphQL subgraph contributions: `Me`, `Session`, `Credential`.

## Internal gRPC

- `SessionService.Validate(token) → Claims`
- `SessionService.Revoke(sessionId)`
- `KeyService.JWKS() → JWKSet`

See [`proto/auth/v1/auth.proto`](proto/auth/v1/auth.proto).

## Events emitted

| Topic | When |
| --- | --- |
| `auth.session.started.v1` | Successful login |
| `auth.session.ended.v1` | Logout, revoke, refresh-token reuse |
| `auth.credential.rotated.v1` | Passkey added/removed; password change |

Partition key: `user_id`.

## Data ownership

- `users`, `credentials`, `sessions`, `refresh_tokens`, `webauthn_credentials` tables in `auth_pg`.
- Per-user rate limit + active-session cache in `auth_redis`.
- RS256 signing keys live in Vault Transit; rotated weekly per [ADR 0012](../../docs/adr/0012-authentication.md).

## Observability

- SLOs:
  - `Login P95 < 250 ms` (excluding WebAuthn ceremony)
  - `Token verify P99 < 10 ms`
  - `Refresh availability > 99.95 %`
- Dashboard: `grafana/auth-service.json`
- Critical alerts: refresh-token reuse spike, JWKS fetch failures, Vault unseal.

## Runbook

[`docs/runbooks/auth-service.md`](../../docs/runbooks/auth-service.md).
