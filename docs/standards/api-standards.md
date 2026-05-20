# API Standards

> The enforceable standard for every API surface — internal gRPC and the
> external GraphQL plane. Grounded in [ADR 0006](../adr/0006-api-architecture.md)
> (GraphQL federation + gRPC) and [ADR 0019](../adr/0019-schema-first.md)
> (schema-first via Protobuf + Buf).

Status: **binding**.

## 1. The two API planes

| Plane        | Used for           | Tech                                  |
| ------------ | ------------------ | ------------------------------------- |
| **Internal** | service ↔ service  | gRPC over the mesh                    |
| **External** | clients ↔ platform | GraphQL federation, via `api-gateway` |

Clients never call internal gRPC services directly — only the GraphQL gateway.
Services never call each other except over gRPC (or events).

## 2. gRPC conventions

- One proto package per service domain: `next.<domain>.v<N>`.
- Service name ends in `Service`; RPCs are `VerbNoun` (`GetVideo`, `SubmitJob`).
- Request/response messages are named `<Rpc>Request` / `<Rpc>Response` — every
  RPC takes and returns a message (never a bare scalar), so fields can be added
  compatibly.
- Buf `STANDARD` lint applies; CI runs `buf lint`.

## 3. Protobuf versioning

- The package carries `v<N>`; generated Go lives at `gen/go/<domain>/v<N>`.
- Backward-compatible changes (new optional field) keep the version.
- A breaking change cuts `v<N+1>`; `buf breaking` blocks an accidental break in
  CI ([enforcement-mechanisms.md](enforcement-mechanisms.md)).
- Protobuf is the schema source of truth ([ADR 0039](../adr/0039-event-schema-source-of-truth.md));
  no schema is defined twice.

## 4. GraphQL federation

- The external API is a **federated GraphQL graph**; each domain owns a
  subgraph; `api-gateway` composes them ([ADR 0006](../adr/0006-api-architecture.md)).
- A subgraph owns its own types; cross-subgraph references use federation keys,
  not duplicated types.
- GraphQL type names are `PascalCase`; fields `camelCase`; enums
  `SCREAMING_SNAKE` ([naming-conventions.md](naming-conventions.md)).
- Mutations are named `verbNoun`; they take a single `input` object.

## 5. Request validation

- Inbound requests are validated at the **boundary** — `api` (gRPC) and the
  gateway (GraphQL), before business logic.
- gRPC uses `buf.validate` field constraints (uuid format, lengths, ranges) in
  the proto; validation is part of the contract, not scattered code.
- `domain` assumes validated input ([go-service-standards.md](go-service-standards.md) §8).

## 6. Auth propagation

- The external caller authenticates at `api-gateway` (OAuth2/OIDC + RS256 JWT,
  [ADR 0012](../adr/0012-authentication.md)).
- The verified identity propagates **inward** as request metadata / context — a
  downstream service receives an authenticated principal, it does not re-parse a
  raw token.
- Service-to-service identity is the mesh (SPIFFE/SPIRE, [ADR 0018](../adr/0018-workload-identity.md));
  authorization decisions use `access-control` ([ADR 0022](../adr/0022-access-control-rego.md)).

## 7. Error standards

- gRPC errors use the **standard `codes`** — `InvalidArgument`, `NotFound`,
  `FailedPrecondition`, `PermissionDenied`, `Internal`, etc. — chosen
  _semantically_, not all-`Internal`.
- An error message is **safe to surface** — it never leaks internals, secrets,
  or stack detail.
- GraphQL errors carry a stable, typed error code clients can branch on; the
  gateway maps gRPC codes to GraphQL errors consistently.

## 8. Pagination

- List APIs are **cursor-paginated** — an opaque cursor + a page limit. No
  offset pagination on large or growing collections.
- A page limit has a hard maximum (validated, §5).
- Responses return the page + a `nextCursor` (null at the end).

## 9. Rate-limit signaling

- A rate-limited response is explicit — gRPC `ResourceExhausted` / GraphQL a
  typed rate-limit error — with retry guidance, never a silent drop or a hang.
- Trust-aware rate limiting ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md))
  applies at the gateway and on abuse-prone endpoints.

## 10. Prohibited patterns

- ✗ A client calling an internal gRPC service directly (bypassing the gateway).
- ✗ A service calling another service's database or `internal/` instead of its
  API.
- ✗ An RPC taking or returning a bare scalar.
- ✗ All errors as `Internal`; error messages that leak internals.
- ✗ Offset pagination on a large collection; an unbounded page size.
- ✗ A breaking proto change without a version bump.
- ✗ Re-parsing a raw JWT in a downstream service.

## Related

- [ADR 0006](../adr/0006-api-architecture.md) · [ADR 0019](../adr/0019-schema-first.md) · [event-standards.md](event-standards.md) · [security-standards.md](security-standards.md) · [naming-conventions.md](naming-conventions.md)
