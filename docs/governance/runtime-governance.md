# Runtime Governance

> The runtimes NEXT uses are fixed architectural decisions. This document
> operationalizes them and defines the one process by which they may change.

## 0. Principle

Runtime sprawl is one of the fastest ways a polyglot platform loses coherence:
each new language is a new toolchain, a new set of idioms, a new hiring surface,
a new way for two services to be gratuitously different. NEXT's runtimes are
**few, deliberate, and ADR-locked**. Adding one is rare and governed.

## 1. The sanctioned runtimes

| Tier             | Runtime                                 | ADR                                                                                                          |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Backend services | **Go** (Rust for perf-critical workers) | [0007](../adr/0007-backend-languages.md), [0037](../adr/0037-compute-coordinator-worker-split.md)            |
| Frontend / apps  | **TypeScript + React / Next.js**        | [0014](../adr/0014-frontend.md)                                                                              |
| AI / ML          | **Python**                              | [0016](../adr/0016-ai-serving.md)                                                                            |
| Infrastructure   | **Terraform + Kubernetes/Helm**         | [0002](../adr/0002-cloud-target.md), [0011](../adr/0011-kubernetes.md), [0004](../adr/0004-gitops-argocd.md) |

These are **binding**. A `/services/*` directory is a Go module; an `/apps/*`
directory is a TS/React app; `/ai/*` is Python; `/infrastructure/*` is
Terraform + K8s. No exceptions without the process in §3.

## 2. Prohibited patterns

Independent of any single ADR, these are prohibited because they erode the
runtime boundary:

- A **TypeScript / Node backend service** — backend is Go ([ADR 0007](../adr/0007-backend-languages.md)).
- **Backend logic embedded in a frontend app** — apps consume SDKs/contracts,
  they do not host service logic.
- **AI training logic inside a Go service** — Go services may _call_ AI
  inference; training lives in `/ai` ([ADR 0016](../adr/0016-ai-serving.md)).
- A **perf worker inside an unrelated service's directory** — workers live with
  their coordinator ([ADR 0037](../adr/0037-compute-coordinator-worker-split.md)).
- A new runtime introduced **without an ADR** (§3).
- A datastore or messaging system outside the sanctioned set
  ([ADR 0008](../adr/0008-event-bus.md), [0017](../adr/0017-database-per-service.md),
  [0005](../adr/0005-vector-database.md), [0035](../adr/0035-clickhouse-analytics-warehouse.md))
  without an ADR.

CI and CODEOWNERS enforce what they mechanically can; review enforces the rest
([code-review-doctrine.md](code-review-doctrine.md)).

## 3. The runtime exception process

A new runtime (or a sanctioned runtime used outside its tier) is a major
architectural decision. The process:

1. **Proposal** — a `Proposed` ADR stating the runtime, the specific need, why
   no sanctioned runtime suffices, and the cost (toolchain, ops, hiring,
   coherence).
2. **Architecture review** — Claude reviews; the affected domain owner reviews;
   the bar is deliberately high — "would be nicer" is not a need.
3. **Approval** — the ADR is `Accepted` only with the human maintainer's
   sign-off. A runtime decision is never agent-autonomous.
4. **Scope** — the ADR states exactly where the runtime is permitted; it does
   not leak beyond that scope without a further ADR.
5. **Migration governance** — if the new runtime replaces an existing one, the
   ADR includes a migration plan and the old runtime's deprecation path.

The existing Rust allowance ([ADR 0007](../adr/0007-backend-languages.md)) is the
model: a second backend runtime, admitted _only_ for perf-critical workers,
_scoped_ by [ADR 0037](../adr/0037-compute-coordinator-worker-split.md).

## 4. Migration governance

When a runtime, datastore, or framework is replaced:

- the change is an ADR (it supersedes the prior decision);
- the ADR includes the migration plan, the dual-run/cutover strategy, and the
  rollback path;
- migrations are **incremental and reversible** where possible — a big-bang
  runtime swap is itself a prohibited pattern;
- the old runtime is marked deprecated, not silently abandoned, so no one builds
  new work on it mid-migration.

## 5. Agent responsibilities

- **Claude** — owns runtime authority; authors and reviews runtime ADRs; blocks
  runtime violations in review.
- **Codex** — builds within Go / Rust-worker / Terraform / K8s; proposes a
  runtime ADR rather than introducing a runtime ad hoc.
- **Composer** — builds within TS/React; does not introduce a frontend runtime
  or framework swap without an ADR.
- **Copilot** — never scaffolds a service, app, or component in a non-sanctioned
  runtime; the Go-backend directive
  ([.github/instructions](../../.github/instructions/copilot-go-backend-directive.instructions.md))
  is binding on it.

## 6. Review triggers

- A sanctioned runtime hits a hard limitation a worker-tier or a different
  sanctioned runtime cannot address.
- Toolchain or ecosystem shifts make a current runtime choice costly.
- A new tier of workload appears that no sanctioned runtime fits.

## Related documents

- [architecture-governance.md](architecture-governance.md) · [multi-agent-governance.md](multi-agent-governance.md) · [code-review-doctrine.md](code-review-doctrine.md)
- ADRs [0007](../adr/0007-backend-languages.md), [0014](../adr/0014-frontend.md), [0016](../adr/0016-ai-serving.md), [0037](../adr/0037-compute-coordinator-worker-split.md), [0038](../adr/0038-canonical-go-service-layout.md)
