# Infrastructure Standards

> The enforceable standard for `/infrastructure`. Grounded in
> [ADR 0002](../adr/0002-cloud-target.md) (AWS), [ADR 0011](../adr/0011-kubernetes.md)
> (EKS + Karpenter), [ADR 0004](../adr/0004-gitops-argocd.md) (GitOps),
> [ADR 0010](../adr/0010-secrets.md) (Vault + External Secrets).

Status: **binding**.

## 1. Infrastructure as code — always

- All infrastructure is **declared as code** — Terraform for cloud resources,
  Helm/Kubernetes manifests for workloads. No click-ops; no resource exists that
  is not in version control.
- Production state is **reconciled by GitOps** (ArgoCD, [ADR 0004](../adr/0004-gitops-argocd.md))
  — the deployed state is always a git state. A manual change to a cluster is
  drift and is reconciled away.

## 2. Terraform organization

- Terraform is organized by **environment × component** (e.g. networking, EKS,
  data stores, IAM) — not one monolith.
- Remote, locked state; no local state.
- Modules are reused across environments; an environment is a composition of
  modules with environment-specific variables — environments do not diverge by
  copy-paste.
- A Terraform change runs `plan` in CI and is reviewed before `apply`
  ([enforcement-mechanisms.md](enforcement-mechanisms.md)); `apply` is gated.

## 3. Kubernetes conventions

- Workloads run on EKS + Karpenter ([ADR 0011](../adr/0011-kubernetes.md));
  node pools are tiered (general; `gpu-inference` on-demand; `gpu-batch` spot).
- A service is deployed via a Helm chart following the shared `next-service`
  chart shape — services do not each invent a manifest layout.
- Every workload declares **resource requests and limits**, **liveness and
  readiness probes** (wired to `/healthz` and `/readyz`,
  [observability-standards.md](observability-standards.md)), and a
  **PodDisruptionBudget** for anything user-facing.
- Multi-AZ spread; T0/T1 workloads carry the N+1 headroom of
  [docs/resilience/global-topology.md](../resilience/global-topology.md).

## 4. Namespaces

- One namespace per **domain/bounded-area** (`next-identity`, `next-media`,
  `next-discovery`, `next-observability`, …) — not one giant namespace, not one
  per service.
- Namespace = a unit of access control, resource quota, and network policy.

## 5. Environments

- A defined ladder — at least `dev` → `staging` → `production` — each a
  Terraform composition of the same modules.
- Environments are **isolated** — separate state, separate clusters/accounts,
  separate data. No environment depends on another's runtime.
- A change reaches production only through the ladder
  ([docs/governance/release-governance.md](../governance/release-governance.md)).

## 6. Secret management

- Secrets live in **Vault**; Kubernetes secrets are synced by the **External
  Secrets Operator** ([ADR 0010](../adr/0010-secrets.md)).
- **No secret is ever committed to the repo** — not in code, manifests,
  Terraform, compose files, or seed data. CI secret-scans every PR.
- `docker-compose.yml` plaintext credentials are **local-dev only** and must
  never be used as a production manifest or copied into an image.
- Secret access is least-privilege; secret use is audited.

## 7. Deployment & naming

- Deployment, service, and resource names are consistent and predictable —
  `<service>` matches the `/services/<service>` directory; see
  [naming-conventions.md](naming-conventions.md).
- Images are tagged immutably (by content/commit), never by a moving tag in
  production.
- Rollback is a GitOps revert ([docs/governance/release-governance.md](../governance/release-governance.md)).

## 8. Scaling

- Stateless workloads autoscale (HPA + Karpenter); stateful and GPU capacity is
  **forecast and provisioned** ([docs/resilience/capacity-planning.md](../resilience/capacity-planning.md)).
- Autoscaling has sane floors and ceilings; an unbounded autoscaler is a
  cost/incident risk.

## 9. Network & security

- Network policy is default-deny between namespaces; allowed paths are explicit.
- Service-to-service traffic is mesh mTLS ([ADR 0003](../adr/0003-service-mesh.md),
  [ADR 0018](../adr/0018-workload-identity.md)) — `STRICT` in non-local
  environments.
- Ingress is fronted by the edge (CloudFront + WAF) — see
  [docs/resilience/global-topology.md](../resilience/global-topology.md).

## 10. Prohibited patterns

- ✗ A cloud resource or workload not in version control (click-ops).
- ✗ A manual change to a production cluster (GitOps drift).
- ✗ Any secret committed to the repo.
- ✗ Local/unlocked Terraform state.
- ✗ A workload with no resource limits or no probes.
- ✗ A moving image tag in production.
- ✗ Environments that share state or data.
- ✗ `docker-compose.yml` used as a production manifest.

## Related

- ADRs [0002](../adr/0002-cloud-target.md), [0004](../adr/0004-gitops-argocd.md), [0010](../adr/0010-secrets.md), [0011](../adr/0011-kubernetes.md) · [docs/resilience/global-topology.md](../resilience/global-topology.md) · [security-standards.md](security-standards.md)
