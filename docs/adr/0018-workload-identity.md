# 0018. Workload identity: SPIFFE / SPIRE

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/security @next-ecosystem/sre
- **Tags**: security

## Context

Service-to-service mTLS in [ADR 0003](0003-service-mesh.md) requires every workload to have a strong, attested identity that isn't a long-lived secret. We need cross-environment and (in v2) cross-region trust without distributing credentials.

## Decision

**SPIFFE** is the identity format; **SPIRE** is the issuer. Istio consumes SPIFFE IDs for AuthorizationPolicy. Vault's Kubernetes auth method is bound to SPIFFE IDs so workloads receive Vault tokens scoped to their identity.

SPIFFE ID format: `spiffe://next.<env>.local/ns/<namespace>/sa/<service-account>`.

## Alternatives considered

- **Static service tokens** — long-lived; revocation is awkward; rotation is manual.
- **K8s service-account tokens only** — fine in-cluster, weak cross-cluster.
- **Cloud IAM roles only** — strong for cloud-API auth, doesn't help service-to-service inside a cluster.

## Consequences

### Positive
- Cryptographically attested workload identity. Short-lived SVID certificates auto-rotate.
- One identity model spans mesh, Vault, and (in v2) cross-cluster federation.
- Audit chains every privileged operation to a SPIFFE ID, not a shared cred.

### Negative
- SPIRE is a moderately complex add-on; one more critical-tier system.
- Identity model requires team-wide understanding; we maintain a one-page primer in [docs/security.md](../security.md).

## Implementation notes

- SPIRE server HA per environment. Agent runs as DaemonSet.
- Attestation: Kubernetes PSAT + workload selectors (`k8s:ns:<ns>`, `k8s:sa:<sa>`, `k8s:pod-label:<key>:<value>`).
- Federation between environments via SPIRE federation in v2.
