# api-gateway

The edge ingress for all external clients. Composes federated GraphQL subgraphs from every service, enforces auth + rate limits, terminates WebSocket subscriptions, and handles request shaping.

Owner: `@next-ecosystem/platform`. Tier 0 (highest reliability — the single user-visible front door).

## Architecture

- **Envoy** in front for TLS termination, HTTP/3, header rewriting, WAF integration (AWS WAF).
- **Apollo Router** (Rust binary) running the supergraph; subgraphs pulled from a schema registry at startup + on SDL update.
- WebSocket subscriptions terminated locally; events fanned out from Kafka via a thin internal adapter.

## Responsibilities

- Compose the federated GraphQL supergraph.
- Verify JWTs via `packages/go/auth` (JWKS-cached).
- Apply tiered rate limits (Envoy local + global via Redis).
- Enforce persisted-queries allowlist in `prod`.
- Inject trace context + caller identity headers into subgraph calls.
- Strip / redact PII headers downstream.

## SLO

- `Gateway P95 < 150 ms` (subgraph time + ~10 ms overhead).
- `Availability > 99.99 %`.
- `Schema reload time < 60 s`.

## Deployment

Pod count autoscaled on request rate via KEDA against the request_count metric. Topology spread across AZs; PodDisruptionBudget keeps at least 50 % of pods available during voluntary disruption.

[Runbook](../../docs/runbooks/api-gateway.md).
