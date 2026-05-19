# API architecture

Per [ADR 0006](adr/0006-api-architecture.md). Two planes: federated GraphQL externally, gRPC internally.

## External plane — GraphQL Federation

**Composition**: Apollo Federation 2 with Apollo Router (Rust) at `api-gateway`. Every service contributes a subgraph; the router composes them into one supergraph.

**Schema registry**: Apollo Studio (managed). `rover subgraph check` runs in CI; PRs fail on breaking changes without an `@deprecated` migration path.

**Persisted queries**: enforced in prod via APQ; the client compiles its queries at build time and references them by hash.

**Subscriptions**: WebSocket. Live chat, presence, notifications.

**Rate limiting**: tiered token bucket at the router, backed by Redis:
- anonymous: 60 req/min
- authenticated: 600 req/min
- partner: 6 000 req/min
- staff: 60 000 req/min

**Query complexity**: complexity scored at parse time; queries > 1 000 complexity points rejected.

## Internal plane — gRPC

**Transport**: HTTP/2 over Istio mTLS. No TLS termination at the service; ztunnel handles it.

**Schemas**: Protobuf in `proto/` and `services/<svc>/proto/`. Generated to Go (`gen/go`), TS (`gen/ts`), Python (`gen/python`).

**Validation**: [protovalidate](https://github.com/bufbuild/protovalidate) annotations enforce ranges, formats, required fields. Runs on both sides.

**Deadlines**: every call has a deadline. Default 5 s; explicitly bounded per RPC.

**Retries**: gRPC's built-in retry policy + Istio's `VirtualService` retry rules. Idempotent reads retry up to 3×; non-idempotent ops retry only on `UNAVAILABLE`.

**Error model**: `google.rpc.Status` with typed details. Domain errors use a per-service error namespace.

## Schema evolution

Both planes follow:

1. **Additive change** — field added, default value preserved → no consumer impact.
2. **Deprecation** — mark `@deprecated` (GraphQL) or `deprecated = true` (proto). Track usage for 90 days.
3. **Removal** — only after the deprecated field's usage rate is zero for 30 days.
4. **Breaking change** — requires new major (`User2`, `service.v2.Foo`). Old version retired after migration.

## Webhooks (inbound)

`event-gateway` is the only REST surface. Per-partner HMAC signature verification + IP allowlist + WAF.

## Public OAuth / OIDC

`auth-service` exposes OIDC discovery + OAuth endpoints for first-party clients now and third-party apps in v2:

- `/.well-known/openid-configuration`
- `/.well-known/jwks.json`
- `/oauth/authorize`, `/oauth/token`, `/oauth/revoke`, `/oauth/introspect`
