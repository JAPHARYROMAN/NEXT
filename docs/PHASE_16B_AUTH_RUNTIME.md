# Phase 16B Auth Runtime

Phase 16B wires the auth-service registration/session runtime against the Phase
16A contracts. Scope stays inside `auth-service` plus this note.

## Runtime behavior

- `UserService.RegisterUser` normalizes and validates the requested handle.
- Registration now creates the user row and first auth session atomically.
- The first access token is an RS256 JWT with the registered user as `sub` and
  the session id as `sid`.
- `SessionService.Validate` verifies the JWT, checks the Redis revocation cache,
  reads the authoritative Postgres session row, and rejects expired, revoked, or
  subject/session-mismatched tokens.
- `SessionService.Revoke` keeps using Postgres as source of truth and Redis as
  the hot revocation cache.

## Events

- Registration emits `auth.user.registered.v1`.
- The emitted payload is constructed from the generated
  `next.events.auth.v1.UserRegistered` protobuf shape and JSON-encoded with
  protobuf field names for the current Kafka consumer path.

## Deferred items

- Credentialed login remains deferred because the merged Phase 16A auth contract
  exposes registration and session validation, but no login RPC or credential
  request shape.
- Refresh-token rotation remains deferred behind `SessionService.Refresh`.
- Durable event outbox/retry is still a later eventing hardening task; the
  registration event remains best-effort after the database commit.

## Validation

Run:

```bash
buf generate
go test ./... # from services/auth-service
node scripts/go-work-run.mjs test ./...
git diff --check
```
