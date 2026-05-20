# Technical Debt Governance

> How NEXT keeps technical debt **visible, owned, and bounded** — so debt is a
> tracked, managed quantity, never a silent accumulation that eventually makes
> the system unevolvable.

## 0. Principle

Debt is not failure — some debt is a rational, deliberate trade. The failure is
debt that is **invisible, unowned, and unbounded**. Governance turns debt into a
managed quantity: every item classified, owned, prioritized, and — critically —
**given an expiry**.

This document is the standing process; the live list is the
[technical-debt register](../technical-debt/technical-debt-register.md),
established by the Phase 10 coherence audit.

## 1. Debt classes

Every debt item is classified — the class routes it to the right owner and
review cadence.

| Class                | What it is                                                 | Example                                        |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **Architectural**    | drift, duplication, an undocumented or violated decision   | a duplicate transcoding implementation (TD-02) |
| **Runtime**          | a runtime-boundary or service-layout deviation             | two divergent `internal/` layouts (TD-09)      |
| **Event / contract** | event-topology or schema-coherence debt                    | the dual topic catalog (TD-01)                 |
| **Observability**    | a service or path lacking telemetry                        | scaffold services with no instrumentation      |
| **Resilience**       | a missing fallback, untested failover, no degradation path | an unimplemented replay mechanism (TD-12)      |
| **Security**         | an untested security path, an insecure default             | untested auth/JWT paths (TD-05)                |
| **Testing**          | missing or insufficient test coverage                      | near-zero service test coverage (TD-04)        |
| **Process**          | a governance or workflow gap                               | branch-integration drift (TD-03)               |

## 2. Severity

Debt uses the same scale as the coherence audit:

| Severity | Meaning                                                  | Default handling                                   |
| -------- | -------------------------------------------------------- | -------------------------------------------------- |
| **P0**   | the system cannot safely proceed                         | all relevant work stops until fixed                |
| **P1**   | a high architectural / safety risk; gates the next phase | fixed before the next integration phase            |
| **P2**   | important; not blocking                                  | scheduled into a near roadmap window               |
| **P3**   | cleanup / refinement                                     | opportunistic; fixed when the area is next touched |

## 3. The register

Every debt item is a row in the [register](../technical-debt/technical-debt-register.md)
with: `ID · area · description · severity · owner · recommended fix · status`.
Rules:

- **A change that knowingly incurs debt records it in the same PR.** Debt
  created silently is a review failure ([code-review-doctrine.md](code-review-doctrine.md) §6).
- **Every item has a named owner** — the agent or role accountable for the fix
  ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)).
- **An item closes only when the fix has merged to `develop`** — not when it is
  planned.
- The register is **append-honest** — no agent or human quietly drops an item.

## 4. Debt expiration

The mechanism that keeps debt bounded: **debt does not live forever silently.**

- Every **P1/P2** item carries an **expiry** — a date or a phase by which it is
  fixed or formally re-evaluated.
- At expiry, the item is either fixed, or **escalates one severity level** and
  is reviewed. P1 debt past expiry escalates toward release-blocking.
- **P3** debt has no hard expiry but is swept whenever its area is next
  substantively edited.
- An item may be **deliberately accepted** — marked `Accepted`, with a written
  rationale (e.g. TD-19, the lazy ADR-template upgrade). Accepted debt is a
  decision on the record, not an unbounded liability.

Expiration converts "we'll get to it" into a dated, escalating commitment.

## 5. When debt blocks a release

Debt intersects [release governance](release-governance.md):

- **P0** debt — blocks everything until resolved.
- **P1** debt past its expiry — blocks the next release train for the affected
  service/domain; only fixes ride until it clears.
- A service may not be promoted past `functional` to **production-ready** while
  it carries open P1 debt in testing, security, observability, or resilience
  (the Phase 10 production-readiness gate).
- **P2/P3** debt does not block releases — it is scheduled, not gated.

## 6. Debt review cadence

- **Per PR** — new debt is recorded; the reviewer checks it was.
- **Per release train** — P1 debt expiries are checked; expired items gate the
  train.
- **Per integration phase** — the full register is reviewed; severities and
  expiries are re-evaluated.
- **Per coherence audit** — a coherence audit ([architecture-governance.md](architecture-governance.md) §6)
  discovers new architectural debt and writes it into the register; the register
  and the audit are a closed loop.

## 7. Architectural debt is special

Architectural debt (class: architectural / runtime / event) is the most
dangerous, because it **compounds** — drift makes the next change harder, which
invites more drift ([anti-patterns.md](../roadmap/anti-patterns.md) AP-9). So:

- architectural debt is reviewed at **every** integration phase, not just at
  expiry;
- the fix for architectural debt is usually an **ADR** (the reconciliation ADRs
  0036–0039 are exactly this — the design half of fixing TD-01, TD-02, TD-06,
  TD-09);
- accumulating architectural debt is itself a trigger for a full coherence audit.

## 8. The discipline in one line

Debt you can see, that has an owner and an expiry, is **managed**. Debt that is
invisible, unowned, and unbounded is how a system becomes unevolvable. This
governance exists to keep every item of NEXT's debt firmly in the first
category.

## Related documents

- [technical-debt register](../technical-debt/technical-debt-register.md) · [architecture-governance.md](architecture-governance.md) · [release-governance.md](release-governance.md) · [code-review-doctrine.md](code-review-doctrine.md)
- [Phase 10 coherence audit](../audits/phase-10-system-integration-audit.md) · [roadmap/anti-patterns.md](../roadmap/anti-patterns.md)
