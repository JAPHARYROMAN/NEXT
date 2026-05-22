# Enforcement Mechanisms

> Standards that are not enforced are decoration. This document maps every
> standard in this directory to the mechanism that actually enforces it — CI, a
> review gate, an ADR requirement, or `CODEOWNERS` — and states what fails,
> what blocks, and what escalates.

Status: **binding**.

## 0. The three enforcement layers

| Layer              | Catches                                                  | Speed                       |
| ------------------ | -------------------------------------------------------- | --------------------------- |
| **Automated (CI)** | the mechanical — build, lint, schema, secrets, structure | every push, seconds–minutes |
| **Review**         | the contextual — architecture, security, the four lenses | every PR                    |
| **Audit**          | the systemic — drift that per-PR gates miss              | per integration phase       |

A standard is assigned to the _cheapest layer that can enforce it_. Mechanical
rules go to CI; judgment goes to review; whole-system coherence goes to the
periodic audit.

## 1. Automated CI gates

A red gate **blocks merge** ([docs/governance/code-review-doctrine.md](../governance/code-review-doctrine.md) §3).
The mandatory gates and the standards they enforce:

| CI gate                    | Enforces                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Build**                  | all affected modules/apps/services compile                                                                                       |
| **Lint / format**          | language style; Go vet; `buf lint` (proto conventions, [api-standards.md](api-standards.md))                                     |
| **Type checks**            | Go vet, TS typecheck                                                                                                             |
| **`buf breaking`**         | no accidental breaking schema change ([event-standards.md](event-standards.md), [api-standards.md](api-standards.md))            |
| **Tests**                  | affected suites pass; no regressed test ([testing-standards.md](testing-standards.md))                                           |
| **Secret scan**            | no committed secret ([security-standards.md](security-standards.md), [infrastructure-standards.md](infrastructure-standards.md)) |
| **Dependency / vuln scan** | no known-vulnerable dependency ([monorepo-governance.md](monorepo-governance.md) §6)                                             |
| **Structure checks**       | service layout, naming, import-boundary checks (§2)                                                                              |

## 2. Mechanizable structural checks

These standards are concrete enough to be machine-checked and **should** be wired
into CI as they mature:

- **Service layout** — a `/services/*` directory has the canonical structure
  ([go-service-standards.md](go-service-standards.md), [ADR 0038](../adr/0038-canonical-go-service-layout.md)).
- **Naming** — service / package / topic / proto-package names match the grammar
  ([naming-conventions.md](naming-conventions.md)).
- **Import boundaries** — no forbidden cross-import; `domain` imports no I/O; no
  app imports a service ([monorepo-governance.md](monorepo-governance.md) §3).
- **Event schema** — event payloads exist only as proto under
  `packages/events/schemas` ([event-standards.md](event-standards.md)).
- **No per-event topic** — topic references match `<category>.events.v<N>`.
- **Observability presence** — a service exposes `/healthz` + `/readyz` and
  initializes telemetry ([observability-standards.md](observability-standards.md)).

A check that cannot yet be automated is enforced by **review** until it can be.

## 3. The PR template & review gates

Every PR carries the governance checklist ([.github/pull_request_template.md](../../.github/pull_request_template.md)):
ADR impact, ownership boundary, runtime, event-contract, migration,
observability, security, test evidence, rollback. A PR with unaddressed boxes is
not ready for review. Reviewers apply the four lenses — architecture, security,
observability, resilience ([docs/governance/code-review-doctrine.md](../governance/code-review-doctrine.md) §4).

## 4. What requires an ADR

A change is blocked from merge unless it has a linked, accepted (or proposed)
ADR when it ([docs/governance/architecture-governance.md](../governance/architecture-governance.md) §2):

- introduces a runtime, datastore, cache, or messaging system;
- creates a new service category or changes a service's responsibility;
- changes an event-contract pattern or a topic model;
- adds an infrastructure component;
- supersedes a prior decision.

## 5. What requires architecture review

Beyond an ADR, Claude (architecture) reviews when a change:

- crosses a service, runtime, or domain boundary;
- touches a shared-interface package (`events`, `types`, `config`);
- creates a new service, app, or shared package;
- deviates from the canonical service layout (an escalated exception).

Runtime, security-boundary, and superseding-ADR changes additionally require the
**human maintainer** ([docs/governance/architecture-governance.md](../governance/architecture-governance.md) §4).

## 6. Merge blockers — consolidated

A PR does not merge while any holds:

- a red CI gate (§1);
- an unaddressed PR-checklist box (§3);
- a missing required reviewer (§5);
- an architectural change with no linked ADR (§4);
- an accepted-ADR or a binding-standard violation;
- a runtime or domain boundary crossed without approval/assignment;
- `domain` logic or a security-critical path changed with no test
  ([testing-standards.md](testing-standards.md));
- a new flaky test; no rollback plan for a non-trivial change.

## 7. CODEOWNERS structure

`.github/CODEOWNERS` mechanically routes the required domain reviewer. It mirrors
the [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) ownership map; the
conceptual structure:

```
/services/        → backend owners        (Codex domain)
/infrastructure/  → infrastructure owners  (Codex domain)
/ai/              → AI owners              (Codex domain)
/apps/            → frontend owners        (Composer domain)
/packages/ui/             → frontend owners
/packages/design-system/  → frontend owners
/packages/go/             → backend owners
/packages/events/ /types/ /config/  → shared-interface — Claude + the touching domain
/docs/            → architecture owners    (Claude domain)
/docs/adr/        → architecture owners    (Claude — ADR authority)
/.github/         → CI: backend owners; instructions + templates: architecture owners
```

`CODEOWNERS` and [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) are kept
in sync; if they diverge, the ADR governs and `CODEOWNERS` is corrected.

## 8. The periodic coherence audit

Per-PR gates catch local violations; they miss **systemic drift** — duplication,
two conventions for one thing, accumulated debt. The periodic coherence audit
([docs/governance/architecture-governance.md](../governance/architecture-governance.md) §6,
the [Phase 10 audit](../audits/phase-10-system-integration-audit.md) as the
template) is the third enforcement layer. It runs each integration phase and
after a wave of parallel work, and writes findings into the
[technical-debt register](../technical-debt/technical-debt-register.md).

## 9. The principle: enforce, don't exhort

A standard with no enforcement mechanism is an aspiration. Every binding rule in
this directory is, or becomes, a CI check, a review gate, an ADR requirement, or
a `CODEOWNERS` route. A rule that _cannot_ be enforced by any of these is either
rewritten until it can be — or it is not a standard, and it is cut
([docs/governance/engineering-operating-system.md](../governance/engineering-operating-system.md) §7,
the anti-bureaucracy clause).

## Related

- [docs/governance/code-review-doctrine.md](../governance/code-review-doctrine.md) · [docs/governance/architecture-governance.md](../governance/architecture-governance.md) · [.github/pull_request_template.md](../../.github/pull_request_template.md) · every standard in this directory.
