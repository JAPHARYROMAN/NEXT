# 0021. session-service split from auth-service

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/identity
- **Tags**: identity, sessions

## Context

In Phase 1 we put sessions, users, and credentials all inside `auth-service`. That was the right pragmatic shortcut to ship the OAuth surface. Two scaling pressures make it the wrong long-term home:

- A **session** is multi-device, multi-credential, replaceable, and read on every request that carries an access token. Sessions need their own scaling shape.
- An **auth credential** (password, passkey, OAuth subject) is acquired once and verified rarely.

Coupling these mixes two very different read/write profiles in the same Postgres instance.

## Decision

`session-service` becomes its own service. It owns:

- The `sessions` and `refresh_tokens` tables.
- `Create`, `Validate`, `Refresh`, `Revoke`, `List` gRPC RPCs.
- The `session.*` event family on Kafka.
- The fast-path Redis revocation cache.

`auth-service` calls `session-service.Create` after a successful credential verification, and `session-service.Revoke` on logout. Refresh-token rotation lives entirely inside `session-service`.

## Alternatives considered

- **Keep sessions in auth-service** — works for the demo but locks us into one Postgres + one service for two very different access patterns.
- **Sessions in Redis only** — fast but loses the durable refresh-token family record we need for theft detection across restarts.
- **Sessions in the gateway** — pushes state into a stateless component.

## Consequences

### Positive

- Each service scales on its own profile.
- Sessions become a reusable primitive for `notification-auth-service`, `account-recovery-service`, and future surfaces.
- The split crystallises the architecture diagram for the identity ecosystem.

### Negative

- One extra hop on the login path (auth → session). Mitigated by gRPC over Istio inside the same namespace; <2 ms overhead.
- Migration cost from Phase 1's embedded model. Mitigated by event-replay: session-service can rebuild from `auth.session.*` topics.

## Implementation notes

- Phase 5 ships `session-service` as a new module with a fresh schema.
- `auth-service` retains a thin in-process shim for backwards compatibility while we drain; removed in Phase 6.
- Refresh-token reuse → entire token family revoked, `session.theft_detected.v1` emitted, security event escalated.
