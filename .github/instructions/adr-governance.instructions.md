---
applyTo: '**'
description: 'NEXT ADR Governance v1.0 — Architecture Decision Records are binding. All agents must check ADRs before changing architecture, create ADRs for major decisions, never violate Accepted ADRs, escalate conflicts, and respect ownership boundaries.'
---

# NEXT — ADR Governance (v1.0)

> Architecture Decision Records are the institutional memory of NEXT. They are
> **governance infrastructure, not documentation decoration**. Accepted ADRs
> are binding on every agent — Claude, Codex, Composer, and Copilot.

ADRs live in [`/docs/adr`](../../docs/adr/README.md). Read that README for the
lifecycle, numbering, and ownership rules. This file is the always-on directive.

## The five rules

1. **Check ADRs before changing architecture.** Before adding a service,
   database, event topic, runtime, dependency, or infrastructure component,
   read the relevant ADRs. The foundational-decision map in the ADR README
   tells you which ADR governs which area.

2. **Create an ADR for major decisions.** Any new runtime, datastore, event
   contract pattern, infrastructure component, or cross-service architectural
   choice requires a new ADR — proposed before the code that depends on it
   merges. Minor, reversible, in-domain changes do not.

3. **Never violate an Accepted ADR.** An Accepted ADR is binding. If you
   believe one is wrong, do not work around it — propose a superseding ADR.
   Code that contradicts an Accepted ADR must not merge.

4. **Escalate conflicts; do not guess.** If a task conflicts with an ADR, if
   two ADRs conflict, or if no ADR covers a decision you must make, stop and
   escalate to the user or the architecture owner (Claude). Guessing is how
   drift starts.

5. **Preserve ownership boundaries.** Edit only the directories your agent
   owns ([ADR 0034](../../docs/adr/0034-monorepo-boundary-ownership.md)). Do not
   edit outside your domain without an explicit, recorded assignment. Never
   `git add -A` when the working tree may hold another agent's concurrent work.

## When a new ADR is required

| Change                                       | ADR required?           |
| -------------------------------------------- | ----------------------- |
| New runtime / language for a tier            | Yes                     |
| New datastore or warehouse                   | Yes                     |
| New event contract pattern or bus            | Yes                     |
| New infrastructure component                 | Yes                     |
| Changing or superseding a prior decision     | Yes (a superseding ADR) |
| New service following existing patterns      | No                      |
| Bug fix, refactor, test, doc within a domain | No                      |

## How to create an ADR

1. Copy [`docs/adr/template.md`](../../docs/adr/template.md) to
   `NNNN-short-slug.md` with the next unused number.
2. Fill every section — including **Implementation rules**, **Agent
   instructions**, and **Review triggers**. An ADR without enforceable rules and
   a review trigger is not done.
3. Open a docs-only PR with `Status: Proposed`.
4. On consensus, set `Status: Accepted` and add the row to the ADR README index.

## Agent-specific notes

- **Claude** — Owns the ADR system. Reviews PRs for ADR violations and drift.
  Writes and maintains ADRs.
- **Codex** — Must not introduce a runtime, datastore, or infrastructure
  component without an Accepted ADR.
- **Composer** — Must not place backend logic in apps or introduce a backend
  runtime; the frontend runtime is fixed by ADR.
- **Copilot** — Must not scaffold services, runtimes, or architecture. Local
  file-level assistance only.
