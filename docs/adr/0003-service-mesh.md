# 0003. Service mesh: Istio (ambient mode)

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/sre @next-ecosystem/platform
- **Tags**: infrastructure, networking, security

## Context

Fifteen services with mutual dependencies, strict zero-trust requirements, and a need for L7 observability across thousands of pods. We need mTLS by default, declarative authorization, traffic splitting for canaries, and per-request telemetry — without inflating each service's binary with networking concerns.

## Decision

**Istio in ambient mode** is the service mesh. mTLS strict, AuthorizationPolicy default-deny, and Envoy at the gateway layer with `ztunnel` handling L4 + Waypoint proxies for L7.

## Alternatives considered

- **Linkerd** — operationally simpler and lighter, but the L7 feature set (rate limiting, complex routing, external auth) lags Istio and we expect to use those features heavily at the gateway.
- **Cilium service mesh** — strong eBPF-based identity, but the mesh-feature maturity and policy ergonomics aren't there yet. We do plan to use Cilium for CNI.
- **No mesh / per-service libraries** — rejected. Repeating mTLS, retries, and traffic policy in every language binding is exactly the duplication a mesh exists to remove.

## Consequences

### Positive
- mTLS for free across all services; no per-service crypto code.
- Declarative AuthorizationPolicy enforces zero-trust at the network layer.
- Canary and shadow deploys via `VirtualService` weight splits.
- Ambient mode removes the per-pod sidecar, saving ~100 MB and ~50 ms cold-start per pod.

### Negative
- Istio's operational complexity is real; we need dedicated SRE familiarity.
- Ambient mode is newer than sidecar mode; we accept a slightly less-trodden path for the resource savings.
- L7 features require the `Waypoint` proxy on the destination side, adding a hop for those flows.

## Implementation notes

- Cilium as CNI; Istio ambient sits on top.
- Workload identity via SPIFFE; see [ADR 0018](0018-workload-identity.md).
- Gateways managed via Gateway API, not the legacy `Gateway` CRD.
- Authz policies live alongside the service Helm chart in [`infrastructure/kubernetes/apps/<service>/policies`](../../infrastructure/kubernetes).
