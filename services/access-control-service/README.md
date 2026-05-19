# access-control-service

Policy decision point (PDP) for the platform. Hybrid RBAC + ABAC via Rego policy bundles per [ADR 0022](../../docs/adr/0022-access-control-rego.md).

Owner: `@next-ecosystem/identity` + `@next-ecosystem/security`. Status: **scaffolded** — first real bundles in Phase 7.

## Public API (gRPC)

- `AuthzService.Authorize(input)` → `Decision { allow, reason }`
- `AuthzService.Roles(user_id)` → assigned roles
- `AuthzService.GrantRole(user_id, role)` / `RevokeRole(user_id, role)` → staff-only
- `AuthzService.PublishBundle(bundle_ref)` → broadcast a new policy version

## Events

**Emitted**: `access.role.granted.v1`, `access.role.revoked.v1`, `access.policy.published.v1`.
**Consumed**: `auth.user.registered.v1` (seed default role binding), `creator.upgraded.v1` (promote tier).

## Policy bundles

- Authored in Rego, lint-checked + signed.
- Hosted in `s3://next-access-policies-<env>/<domain>/<version>.tar.gz`.
- Local-cached per service for a short TTL; reload triggered by `access.policy.published.v1`.

## Local-first evaluation

Hot paths (every gateway request) call `@next/access-control` which evaluates a tier-scope allowlist in-process. Only ambiguous decisions hit the PDP, keeping P99 latency tight.

## SLO

- `Authorize P95 < 15 ms` · `Bundle reload propagation P95 < 30 s` · `Decision audit completeness: 100%`.

[Runbook](../../docs/runbooks/access-control-service.md) (TBD).
