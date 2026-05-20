# Monorepo Governance

> The dependency and boundary rules of the NEXT monorepo. Its job: keep one
> repository from becoming an entangled ball where any change can break
> anything. Grounded in [ADR 0001](../adr/0001-monorepo-tooling.md) and
> [ADR 0034](../adr/0034-monorepo-boundary-ownership.md).

Status: **binding**.

## 1. The top-level map

| Directory         | Contains                                  | Owner ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) |
| ----------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `/services`       | Go backend services                       | Codex                                                          |
| `/apps`           | TS/React applications                     | Composer                                                       |
| `/packages`       | shared libraries (TS, Go, Rust, Python)   | shared by sub-tree                                             |
| `/ai`             | Python AI/ML subsystems                   | Codex                                                          |
| `/infrastructure` | Terraform, K8s, Helm                      | Codex                                                          |
| `/docs`           | architecture, ADRs, governance, standards | Claude                                                         |
| `/.github`        | CI, templates, instructions               | Codex (CI) / Claude (instructions, templates)                  |

Every directory has exactly one owner; a change is made by the owner or under a
recorded cross-domain assignment.

## 2. Dependency direction

Dependencies flow **one way**. The legal direction:

```
 apps ──▶ packages (frontend) ──▶ packages (shared)
 services ──▶ packages/go/* ──▶ gen/go (generated)
 ai ──▶ packages/python/*
        every tier ──▶ generated contracts (proto)
```

- `apps` depend on packages; **packages never depend on apps**.
- `services` depend on `packages/go/*` and generated proto; **shared packages
  never depend on a service**.
- The arrow never reverses. A shared package importing an app or a service is a
  cycle and a violation.

## 3. Forbidden cross-imports

- ✗ **A service importing another service's `internal/`.** Services talk over
  gRPC and events, never by code import.
- ✗ **An app importing a service**, or a backend package, or hitting a database.
  Apps consume the GraphQL gateway and `@next/*` SDKs only.
- ✗ **A shared package importing an `app` or a `service`** (§2).
- ✗ **`domain` importing I/O** within a service ([go-service-standards.md](go-service-standards.md) §3).
- ✗ **A frontend package importing a backend package**, or vice versa.
- ✗ **`/ai` and `/services` importing each other's code** — they integrate over
  inference contracts and events, not imports.

## 4. Runtime separation

- Go (`/services`, `packages/go`), TypeScript (`/apps`, frontend `/packages`),
  Python (`/ai`, `packages/python`), Rust (perf workers, `packages/rust`) are
  **separate runtime zones**.
- A zone does not import another zone's source. Zones integrate only through
  **contracts** — proto/gRPC, events, generated clients.
- Runtime separation is what lets one zone be rebuilt or re-architected without
  touching another.

## 5. Shared package doctrine

- A shared package exists because **two or more consumers** genuinely need it.
  One consumer ⇒ the code belongs in that consumer, not a package.
- A package has **one clear purpose** and a name that states it
  ([naming-conventions.md](naming-conventions.md)) — no two packages overlap in
  purpose ([the Phase 10 audit flagged UI proliferation](../audits/package-boundary-audit.md)).
- **Shared-interface packages** (`packages/events`, `packages/types`,
  `packages/config`) are co-owned and change **interface-first**
  ([docs/governance/multi-agent-governance.md](../governance/multi-agent-governance.md) §5).
- A new shared package requires architecture review — it must prove no existing
  package is its home.

## 6. Dependency review

- Adding a third-party dependency is reviewed — for security (vulnerability
  scan), licensing, maintenance health, and whether it duplicates something
  already in the tree.
- Dependency _versions_ are managed centrally where the tooling allows (pnpm
  catalog, Go workspace, Cargo workspace, uv workspace) — services do not each
  pin divergent versions of a shared dependency.
- A dependency that creates a forbidden cross-import (§3) is rejected regardless
  of its merits.

## 7. The generated-code boundary

- `gen/go` (and equivalent) is **generated** from proto by Buf — it is not
  hand-edited. It is the contract boundary between runtime zones.
- Generated code is reproducible — anyone can regenerate it from the schemas.

## 8. Why a monorepo, governed

A monorepo gives NEXT atomic cross-cutting changes, one dependency graph, and
one place to enforce standards — but only if the boundaries inside it are real.
Without these rules a monorepo degrades into a tangle where everything depends
on everything. The dependency direction (§2), the forbidden cross-imports (§3),
and runtime separation (§4) are what keep the monorepo a set of _bounded
modules that share a repo_ rather than one giant coupled system.

## 9. Prohibited patterns

- ✗ Any forbidden cross-import (§3).
- ✗ A dependency-direction reversal / an import cycle (§2).
- ✗ A shared package for a single consumer.
- ✗ Two packages with overlapping purpose.
- ✗ A new shared package without architecture review.
- ✗ Hand-editing generated code.
- ✗ Divergent versions of a shared third-party dependency across services.

## Related

- [ADR 0001](../adr/0001-monorepo-tooling.md) · [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) · [go-service-standards.md](go-service-standards.md) · [frontend-standards.md](frontend-standards.md) · [enforcement-mechanisms.md](enforcement-mechanisms.md)
