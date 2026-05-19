# 0006. API plane: GraphQL Federation (external) + gRPC (internal)

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform
- **Tags**: api, architecture

## Context

We have two distinct API audiences with very different requirements:

- **External clients** (web, mobile, TV, partners) want one composable, typed query surface that returns exactly the data needed for a screen, with subscriptions for real-time.
- **Internal services** want strong typing, code generation, streaming, deadlines, and the lowest latency possible.

## Decision

- **External plane**: GraphQL Federation 2 via Apollo. Every service contributes a subgraph; `api-gateway` runs the federated router. WebSocket subscriptions for live updates.
- **Internal plane**: gRPC over Istio mTLS, with `protovalidate` for input validation and `connect-go` / `connect-es` for clients that benefit from HTTP/JSON fallback. Schemas in [`proto/`](../../proto), generated via [`buf`](https://buf.build).

REST exists only for inbound webhooks handled by `event-gateway`.

## Alternatives considered

- **REST only** — rejected for the external plane. The query-shape mismatch between web, mobile, TV, and admin would force either over-fetching or N endpoints per screen.
- **gRPC-Web for external clients** — viable, but loses the strong client query authorship and caching story of GraphQL. We may layer Connect protocols later for the few endpoints that benefit.
- **BFF per client** — risk of drift between BFFs; federation gives us a single composable surface that clients shape themselves.
- **GraphQL between services** — rejected. The cognitive overhead and weaker latency story (resolver chains) make it a worse fit for service-to-service.

## Consequences

### Positive
- Clients fetch exactly what a screen needs; mobile bandwidth gain is measurable.
- Subgraphs evolve independently; the gateway composes them.
- gRPC internal gives us deadlines, streaming, and codegen for free.
- Strict separation: external clients never touch gRPC directly.

### Negative
- Two protocols to operate, monitor, and document.
- GraphQL N+1 risk requires dataloader discipline and per-subgraph query complexity limits.
- Federation v2 adds a meaningful operational layer (router, schema registry, supergraph composition).

## Implementation notes

- Subgraph contracts validated in CI via [Apollo Rover](https://www.apollographql.com/docs/rover/) `subgraph check`.
- Supergraph composition: GitHub Action on PR; supergraph SDL published to S3 as part of release.
- Persisted queries enforced from clients via Automatic Persisted Queries (APQ) + an allowlist for production.
- Rate limits enforced at the gateway per identity tier; complexity costs computed at parse time.
- Internal RPC client codegen lives in `gen/` (Go), `packages/api-client` (TS), `gen/python` (Python).
