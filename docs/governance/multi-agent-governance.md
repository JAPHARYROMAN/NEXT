# Multi-Agent Governance

> The operating doctrine for NEXT's four AI agents. This document **operates**
> the decisions in [ADR 0033](../adr/0033-multi-agent-governance.md) and
> [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) — it does not re-decide
> them; where it could appear to differ, the ADRs govern.

## 0. The model in one line

**No agent owns the whole system. Each agent owns a bounded domain, works on its
own branch, and may not act outside its domain without an explicit assignment.**

## 1. The four agents

| Agent        | Role                        | Owns                                                                                                            |
| ------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Claude**   | Architecture & coherence    | `/docs`, ADRs, governance, cross-service refactors, system-wide review, integration audits, strategic foresight |
| **Codex**    | Backend & infrastructure    | `/services`, `/infrastructure`, `/ai` implementation, backend `/packages`, `/.github` CI                        |
| **Composer** | Frontend & experience       | `/apps`, `/packages/ui`, `/packages/design-system` and the frontend package family                              |
| **Copilot**  | Implementation acceleration | local, file-level completion only — no autonomous system ownership                                              |

Directory-level ownership is authoritative in [ADR 0034](../adr/0034-monorepo-boundary-ownership.md);
shared-interface packages (`/packages/events`, `/packages/types`,
`/packages/config`) are co-owned under the interface-first protocol (§5).

## 2. Authority boundaries

Each agent holds defined authority. Authority is **scoped** — holding it in your
domain does not extend it into another's.

| Authority                                                    | Holder                                               |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| Architectural authority — ADRs, runtime decisions, coherence | **Claude**                                           |
| Backend/infra implementation authority                       | **Codex**, within its domain                         |
| Frontend/experience implementation authority                 | **Composer**, within its domain                      |
| Runtime authority — whether a runtime may be used            | **Claude** (via ADR); no agent self-grants           |
| Integration authority — what merges to `develop`             | shared; gated by review + audit                      |
| Release authority                                            | see [release-governance.md](release-governance.md)   |
| Incident authority                                           | see [incident-governance.md](incident-governance.md) |

Copilot holds **no** standing authority — it acts only within work an owning
agent is already directing.

## 3. Branch model

Per [ADR 0033](../adr/0033-multi-agent-governance.md): `main` is
production-stable (no direct commits); `develop` is integration; each agent
works on `agent/claude-architecture`, `agent/codex-backend`,
`agent/composer-frontend`. Rules:

- An agent commits **only files in its own domain** — never `git add -A` when the
  tree may hold another agent's concurrent work; stage explicit paths.
- Work reaches `main` only via `develop`, only after review + checks
  ([code-review-doctrine.md](code-review-doctrine.md)).
- A change crossing a domain boundary requires a recorded assignment **before**
  work starts (§4).

## 4. Cross-domain work & assignment

When work must cross a domain boundary:

1. The originating agent (or a human) **records an assignment** — in the task or
   the PR — naming the crossing, the reason, and the owning agent's
   acknowledgement.
2. The **owning agent of the touched domain** performs or explicitly approves
   the change. An agent does not edit another's domain unilaterally.
3. Claude is notified of any cross-domain architectural change.

No assignment, no cross-domain edit. This is the single rule that prevents the
intermingled-working-tree failure the Phase 10 audit documented (drift DR-3).

## 5. Shared-interface packages: interface-first

`/packages/events`, `/packages/types`, `/packages/config` are co-edited by
design. They change **interface-first**:

1. Types / contracts / schemas land first.
2. Tests against the new contract land second.
3. Implementations consuming the contract land third.
4. The editing agent **announces** the contract change so dependent agents
   adapt.

A breaking change to a shared interface is an architecture change — it requires
review and, if it alters a contract, an ADR ([architecture-governance.md](architecture-governance.md)).

## 6. Escalation

Escalate — do not guess — when:

- a task conflicts with an ADR or the Constitution;
- two ADRs, or an ADR and an instruction, conflict;
- no ADR covers a decision that needs making;
- a change must cross a domain boundary and no owner has been assigned;
- an agent believes an accepted ADR is wrong.

Escalation path: **the owning agent → Claude (architecture) → the human
maintainer.** Escalation is a first-class, expected action — guessing is the
failure, not escalating.

## 7. Conflict resolution

| Conflict                                             | Resolution                                                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Two agents both want to own a change                 | the directory owner ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) owns it; the other gets an assignment or defers |
| Disagreement on an architectural decision            | Claude decides via ADR; an agent that disagrees proposes a superseding ADR — it does not work around the decision            |
| Disagreement on whether a change needs an ADR        | default to **yes**; cheap to write, expensive to omit                                                                        |
| An agent's work conflicts with another's in the tree | the branch model (§3) prevents it; if it occurs, each agent re-bases its own domain onto `develop`                           |
| Two ADRs conflict                                    | escalate to Claude; one supersedes the other                                                                                 |

## 8. The architectural override doctrine

Claude holds architectural authority — but it is **bounded**, not a dictatorship
(an explicit anti-goal of the EOS):

- Claude may **block** a change that violates an accepted ADR, crosses a runtime
  boundary without approval, or breaks coherence — and must cite the specific
  ADR or principle.
- Claude may **not** block a change merely for stylistic preference, or override
  an implementation decision that is correct and in-domain.
- An agent (or human) who believes a Claude block is wrong escalates to the
  **human maintainer**, who is the final authority.
- Architectural decisions are made **as ADRs**, in the open — not as private
  vetoes. "Because I said so" is not a governance act; "because ADR 00NN" is.

## 9. Hallucination & error containment

AI agents can be confidently wrong. The model contains it structurally:

- **Bounded domains** cap the blast radius of any one agent's error.
- **Branch isolation** keeps an error off `main` until review.
- **Review + CI gates** ([code-review-doctrine.md](code-review-doctrine.md)) are
  designed assuming the author may be mistaken.
- **ADRs as the source of truth** — an agent checks the ADR rather than relying
  on its own recollection; "the memory says X" is never sufficient.
- **Escalation over guessing** (§6) — uncertainty routes to a human, not to a
  confident invention.

Detail of the per-agent permission scopes is in
[ai-agent-permissions.md](ai-agent-permissions.md).

## Related documents

- [ai-agent-permissions.md](ai-agent-permissions.md) · [architecture-governance.md](architecture-governance.md) · [code-review-doctrine.md](code-review-doctrine.md)
- [ADR 0033](../adr/0033-multi-agent-governance.md) · [ADR 0034](../adr/0034-monorepo-boundary-ownership.md)
