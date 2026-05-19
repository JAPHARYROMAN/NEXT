# 0012. Authentication: OAuth2 + OIDC + RS256 JWTs

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/identity @next-ecosystem/security
- **Tags**: security, auth

## Context

NEXT needs user authentication for web, mobile, TV, and partner integrations; machine-to-machine for services and webhooks; and a credential model that works for both first-party clients and an eventual public OAuth platform for third-party apps.

## Decision

- **OAuth2 + OIDC** is the protocol family. `auth-service` implements the authorization server.
- **RS256 JWTs** for access tokens, 15-minute TTL. Asymmetric keys stored in Vault Transit; signing key rotated weekly; old keys honored for one additional week to allow client drain.
- **Refresh tokens** opaque, server-side, rotated on use (rotation detects refresh-token theft).
- **mTLS** for service-to-service via SPIFFE — see [ADR 0018](0018-workload-identity.md).
- **Passkeys (WebAuthn)** as the primary user credential; password fallback only for accounts that opt in.
- **Device attestation** for mobile and TV clients.

## Alternatives considered

- **HS256 / shared-secret JWTs** — rejected: requires sharing the secret with every verifier, a non-starter at our service count.
- **Opaque tokens only** — rejected for performance: every gateway request would round-trip to auth-service.
- **Auth0 / Okta** — capable but expensive at our user counts, and we want full control over the identity primitives that power our creator platform.
- **Magic links only** — rejected as a primary credential due to weaker security model; offered as an entry path.

## Consequences

### Positive
- Asymmetric JWTs: any service verifies tokens locally with a cached JWKS — no auth-service round trip in the hot path.
- Short access TTL + refresh rotation contains compromise blast radius.
- Passkeys eliminate the password attack surface for the majority of users.

### Negative
- Key rotation requires JWKS cache invalidation discipline in every service; `packages/auth-sdk` handles this centrally.
- Migrating users from password-only to passkey is a multi-step product flow.

## Implementation notes

- `auth-service` exposes OIDC discovery at `/.well-known/openid-configuration`.
- `packages/auth-sdk` provides Go, TS, Rust, Python verifiers that cache the JWKS for ten minutes.
- API gateway rejects requests with invalid or unsigned tokens at the edge.
- Refresh-token rotation: when a refresh token is used, the prior one is invalidated; if it's used again, the entire family is invalidated and a security event emitted.
