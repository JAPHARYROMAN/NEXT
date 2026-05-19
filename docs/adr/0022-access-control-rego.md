# 0022. Access control via Rego policy bundles

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/identity @next-ecosystem/security
- **Tags**: authz, security

## Context

NEXT needs hybrid RBAC + ABAC. Tier-based gates (`creator`, `staff`) are RBAC; per-resource decisions (`can U comment on V given V.commentsClosed and U.muted`) are ABAC. A single mechanism that handles both, with policies written outside service code, lets us evolve safety rules without redeploying every service.

## Decision

- **OPA / Rego** is the policy language.
- `access-control-service` is the **policy decision point (PDP)** — its gRPC `Authorize(input)` returns `allow | deny | …` plus a reason.
- Every service is a **policy enforcement point (PEP)** — calls the PDP on the request path (cached locally with short TTL).
- Policy **bundles** are signed, hosted in a `policy-bundles` S3 prefix, pulled by the service on startup + on a `access.policy.published.v1` event.

## Alternatives considered

- **Casbin** — strong RBAC, weaker ABAC + worse policy ergonomics.
- **Hardcoded checks per service** — fast to write, hard to audit, impossible to update without redeploys.
- **Cedar** (AWS) — promising, but smaller ecosystem and tooling than OPA at this stage.

## Consequences

### Positive

- One policy language across every service.
- Policy changes ship without code redeploys.
- The decision point is auditable; every `Authorize` call emits a structured decision record.

### Negative

- Two extra hops on cold cache (service → PDP → bundle store). Mitigated by local caching with a short TTL + invalidation event.
- Rego has a learning curve. Mitigated by an in-repo policy library + tests.

## Implementation notes

- Bundles live under `infrastructure/security/policies/<domain>/`.
- Per-service Helm chart pulls the bundle name to use.
- Local evaluation supported via `opa eval` for low-traffic services to skip the network hop.
- Decision audit emits `access.decision.v1` (Phase 6 add-on, omitted from MVP).
