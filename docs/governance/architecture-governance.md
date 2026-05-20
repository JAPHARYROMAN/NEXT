# Architecture Governance

> How architectural change happens at NEXT — when a decision needs an ADR, who
> approves it, what blocks a merge, and how coherence is verified over time.

## 0. Principle

Architecture is governed so it can **change safely**, not so it cannot change.
The goal is the opposite of an architecture freeze: a clear, low-friction path
for deliberate change, and a firm stop for _accidental_ change. Most work needs
no architecture governance at all (see [the EOS](engineering-operating-system.md)
§2 — heavy at boundaries, light everywhere else).

## 1. What counts as an architectural change

A change is architectural — and enters this governance — when it does any of:

- introduces a runtime, datastore, cache, or messaging system;
- creates a new service, or changes a service's responsibility;
- changes an event contract, a proto schema, or a topic model;
- changes a database schema in a way other services observe;
- changes a cross-service boundary or a shared-interface package;
- changes infrastructure topology, or a security/auth boundary;
- supersedes or contradicts an existing ADR.

A change that does **none** of these — in-domain logic, a bug fix, a refactor
within a service, a test, a doc — is **not** an architectural change and needs
only normal review ([code-review-doctrine.md](code-review-doctrine.md)).

## 2. When an ADR is mandatory

Per the [ADR governance instruction](../../.github/instructions/adr-governance.instructions.md)
and the [ADR README](../adr/README.md):

| Change                                         | ADR?                        |
| ---------------------------------------------- | --------------------------- |
| New runtime / language tier                    | **Yes**                     |
| New datastore, cache, warehouse                | **Yes**                     |
| New event-contract pattern or messaging system | **Yes**                     |
| New infrastructure component                   | **Yes**                     |
| Changing or reversing a prior decision         | **Yes** — a superseding ADR |
| New service following existing patterns        | No                          |
| In-domain bug fix, refactor, test, doc         | No                          |

Unsure ⇒ it needs an ADR. Cheap to write, expensive to omit.

## 3. The architecture-change lifecycle

```
 idea ──▶ Proposed ADR ──▶ architecture review ──▶ Accepted ADR ──▶ implementation ──▶ audit
            │                     │                     │
       docs/adr/NNNN-*      Claude + domain owner   index updated,
       (template.md)        (+ maintainer for        agents notified
                             runtime/security)
```

1. **Propose** — copy [`template.md`](../adr/template.md) to the next number;
   fill every section, including _Implementation rules_, _Agent instructions_,
   _Review triggers_. Open a docs-only PR, `Status: Proposed`.
2. **Review** — see §4.
3. **Accept** — on consensus, `Status: Accepted`, add to the ADR index, merge.
4. **Implement** — code that depends on the decision may now merge; the PR
   references the ADR.
5. **Audit** — periodic coherence audits (§6) verify the decision is honored.

An ADR is `Proposed` _before_ the code that depends on it merges — architecture
is decided in the open, then built, not reverse-engineered from a merged PR.

## 4. Who approves architectural change

| Change class                                                                    | Approver(s)                                                                                   |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Standard architectural change (new service on existing patterns, schema change) | Claude + the owning domain agent                                                              |
| Runtime addition / change                                                       | Claude + domain owner + **human maintainer** ([runtime-governance.md](runtime-governance.md)) |
| Security / auth boundary change                                                 | Claude + domain owner + security review                                                       |
| Superseding an accepted ADR                                                     | Claude + the original decision's owners + human maintainer                                    |
| Cross-domain architectural change                                               | Claude + **both** domain owners                                                               |

Claude holds architectural authority but it is **bounded** — decisions are made
as ADRs in the open, and a disputed Claude block escalates to the human
maintainer ([multi-agent-governance.md](multi-agent-governance.md) §8).

## 5. Merge blockers

A PR is **blocked from merge** if any of these is true:

- it makes an architectural change (§1) with **no Accepted or linked ADR**;
- it **contradicts an Accepted ADR** and is not itself the superseding ADR;
- it crosses a **runtime boundary** without the [runtime exception](runtime-governance.md) approval;
- it crosses a **domain boundary** without a recorded assignment
  ([multi-agent-governance.md](multi-agent-governance.md) §4);
- it changes an **event contract** without versioning + updating consumers/docs
  ([ADR 0036](../adr/0036-event-topology.md), [0039](../adr/0039-event-schema-source-of-truth.md));
- the required architecture reviewer (§4) has not approved.

These blockers are encoded in the PR template's governance checklist and, where
mechanizable, in CI + CODEOWNERS.

## 6. Coherence audits

Architecture governance is not only gate-by-gate; it is also **periodic
verification** that the whole still hangs together. A coherence audit — the
Phase 10 [system integration audit](../audits/phase-10-system-integration-audit.md)
is the template — is run:

- at the start of each integration phase;
- after a wave of parallel multi-agent work;
- when the [technical-debt register](../technical-debt/technical-debt-register.md)
  shows accumulating architectural debt.

An audit checks runtime boundaries, service patterns, event coherence, package
boundaries, and multi-agent drift, and writes findings into the debt register.
The audit is the loop's checksum — it catches the drift that per-PR gates miss.

## 7. Architecture decisions the roadmap will require

The [roadmap](../roadmap/README.md) already names major future ADRs (a
semantic-discovery substrate redesign, an interactive-media content model, an
edge-compute platform, and others). Naming them in advance is itself an act of
architecture governance — it ensures those decisions arrive as deliberate ADRs
when their phase begins, not as accidents discovered in a merged PR.

## Related documents

- [runtime-governance.md](runtime-governance.md) · [multi-agent-governance.md](multi-agent-governance.md) · [code-review-doctrine.md](code-review-doctrine.md) · [technical-debt-governance.md](technical-debt-governance.md)
- [ADR system](../adr/README.md) · [adr-governance instruction](../../.github/instructions/adr-governance.instructions.md)
