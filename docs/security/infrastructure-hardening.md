# Infrastructure Hardening

> Hardening the ground NEXT runs on — Kubernetes, the network, nodes, the edge.
> Its job: shrink the attack surface and contain a breach so a compromise is a
> bounded incident, not a platform-wide one.

## 0. Principle

Hardening operationalizes two zero-trust principles: **least privilege** and
**assume breach**. Every workload runs with the minimum it needs; every boundary
is a containment line. The question behind every rule here is: _when something
is compromised, how far can it get?_ — and the answer must always be "not far".

Grounded in [ADR 0011](../adr/0011-kubernetes.md) (EKS) and
[docs/standards/infrastructure-standards.md](../standards/infrastructure-standards.md).

## 1. Kubernetes / pod hardening

Every workload **MUST**:

- run as a **non-root** user, with a **read-only root filesystem** where
  possible;
- **drop all Linux capabilities** and add back only those genuinely required;
- run with `allowPrivilegeEscalation: false`; **no privileged pods** — a
  privileged pod is a flagged, reviewed exception with an ADR-grade
  justification;
- declare **resource requests and limits** — an unbounded workload is a DoS and
  noisy-neighbor risk;
- conform to the cluster's enforced **Pod Security Standard** (`restricted`
  baseline) — non-conforming pods are rejected by admission control.

## 2. Network policy

- **Default-deny** pod-to-pod traffic; every allowed path is an explicit
  `NetworkPolicy` ([zero-trust-architecture.md](zero-trust-architecture.md) §3).
- Namespaces are domain-bounded; cross-namespace traffic is explicitly allowed,
  never ambient.
- Datastores accept connections only from their owning service's workloads.
- Egress is restricted — a workload reaches only the destinations it needs;
  unrestricted outbound is a data-exfiltration path.

## 3. Container & image isolation

- Containers run from **minimal base images** — small attack surface, fewer
  CVEs.
- Images are **signed and verified** before they run ([supply-chain-security.md](supply-chain-security.md));
  an unsigned image does not deploy.
- High-risk workloads that process untrusted input — notably transcode workers
  ([media-security.md](media-security.md)) — get **extra isolation**:
  stricter sandboxing, tighter egress, ephemeral-per-job where feasible.

## 4. Node hardening

- Nodes run a minimal, hardened OS image; node images are patched on a cadence.
- Node-level access is restricted and audited; no routine human shell on a
  production node.
- GPU nodes ([ADR 0011](../adr/0011-kubernetes.md)) follow the same hardening;
  GPU pools are isolated by purpose ([ai-security.md](ai-security.md)).

## 5. Edge protection

- The edge (CloudFront + WAF + DDoS protection) is the only internet-facing
  surface — it filters volumetric attacks and obvious malicious traffic before
  anything reaches a region ([api-security.md](api-security.md),
  [incident-response.md](incident-response.md)).
- TLS terminates at the edge; everything behind it is private and meshed.
- DDoS resilience leans on the edge's absorption capacity and on the platform's
  cacheable-at-the-edge design ([docs/resilience/incident-response.md](../resilience/incident-response.md) §8).

## 6. Environment separation

- `dev` / `staging` / `production` are **fully isolated** — separate
  clusters/accounts, separate state, separate data, separate secrets
  ([service-authentication.md](service-authentication.md) §4,
  [docs/standards/infrastructure-standards.md](../standards/infrastructure-standards.md)).
- No environment depends on another at runtime; a non-production compromise
  cannot reach production.
- Production data does not flow into non-production environments unredacted.

## 7. Production access doctrine

Human access to production is the highest-value target, so it is the most
constrained:

- **No standing production access.** Access is **just-in-time** — requested,
  approved, time-boxed, and **fully audited** ([security-observability.md](security-observability.md)).
- **Break-glass** — emergency access for an incident is a defined, audited
  path; using it raises an alert and triggers a review.
- Routine operations go through **GitOps** ([ADR 0004](../adr/0004-gitops-argocd.md))
  — a change is a reviewed commit, not a human at a `kubectl` prompt. A manual
  production change is drift and is itself a security signal.
- Privileged actions are least-privilege, scoped, and audited.

## 8. Privileged-workload restrictions

- A workload needing elevated privilege (host access, a capability, privileged
  mode) is a **reviewed exception** — justified, scoped, documented, and
  minimized. The default is none.
- Such workloads get extra monitoring; their privilege is a tracked item.

## 9. Prohibited patterns

- ✗ A privileged pod, a root container, or `allowPrivilegeEscalation: true`
  without a reviewed exception.
- ✗ A workload with no resource limits.
- ✗ Default-allow pod-to-pod networking.
- ✗ A publicly reachable datastore or internal service.
- ✗ An unsigned image running in the cluster.
- ✗ Standing human access to production.
- ✗ A manual change to a production cluster (GitOps drift).
- ✗ Environments sharing state, data, or secrets.
- ✗ Transcoding untrusted media in an un-isolated worker.

## Related

- [docs/standards/infrastructure-standards.md](../standards/infrastructure-standards.md) · [zero-trust-architecture.md](zero-trust-architecture.md) · [supply-chain-security.md](supply-chain-security.md) · [docs/resilience/global-topology.md](../resilience/global-topology.md) · [ADR 0011](../adr/0011-kubernetes.md)
