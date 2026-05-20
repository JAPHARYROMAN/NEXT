# 0033. Multi-agent governance model

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture
- **Tags**: governance, process, ai-agents

## Context

NEXT is built by four AI agents working in parallel — Claude Code, Codex,
Composer, and Copilot. Parallel agents on one codebase, with no rules, produce
the failure modes this project cannot afford: duplicated services, contradictory
architecture, runtime confusion, files clobbered mid-edit, and decisions made by
whichever agent happened to touch a file last.

A concrete instance already occurred: three agents' uncommitted work
intermingled in a single working tree on `main` because isolation branches did
not yet exist. This ADR makes the governance model that prevents that explicit,
durable, and enforceable.

## Decision

NEXT operates under a **bounded-domain multi-agent model**. Each agent owns a
specific domain, works on its own branch, and may not edit outside its domain
without an explicit assignment. No agent owns the whole system.

| Agent           | Role                                    | Owns                                                                           |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| **Claude Code** | Architecture & coherence                | `/docs`, ADRs, cross-service refactors, system-wide review, dependency cleanup |
| **Codex**       | Backend & infrastructure implementation | `/services`, `/infrastructure`, backend `/packages/go/*`, backend tests        |
| **Composer**    | Frontend & product experience           | `/apps`, `/packages/ui`, `/packages/design-system`, frontend packages          |
| **Copilot**     | Local implementation accelerator        | File-level completion only — no autonomous system ownership                    |

Directory-level ownership is specified in [ADR 0034](0034-monorepo-boundary-ownership.md).

## Rationale

Bounded domains make parallelism safe: two agents that never write the same
files cannot conflict. A single owner per domain means there is always a
clear answer to "who decides this", which is what keeps the architecture
coherent as four agents move at once. Copilot is deliberately scoped to
file-local work because completion-style assistance has no view of the system
and must not make structural decisions.

## Alternatives considered

- **No governance — any agent edits anything** — maximum speed, guaranteed
  drift and conflicts. This is the status quo the ADR exists to end. Rejected.
- **A single agent does everything sequentially** — perfectly coherent, far too
  slow; wastes the parallelism that four agents provide. Rejected.
- **Ownership by feature, not by directory** — features cut across services,
  apps, and packages, so feature-ownership reintroduces the shared-file
  conflicts. Directory ownership is unambiguous. Rejected.

## Consequences

### Positive

- Parallel agents cannot clobber each other's files when domains are respected.
- Every part of the system has one accountable owner.
- Architectural decisions route through one agent (Claude), preserving coherence.

### Negative

- Cross-cutting work needs an explicit hand-off or assignment — more process.
- A domain owner can become a bottleneck for changes that touch its area.

### Neutral / open questions

- Shared-interface packages (`/packages/events`, `/packages/types`) are
  co-edited by design; their change protocol is interface-first (see rules).

## Implementation rules

- Each agent works only on its branch: `agent/claude-architecture`,
  `agent/codex-backend`, `agent/composer-frontend`. `main` is production-stable;
  `develop` is the integration branch. No direct commits to `main`.
- An agent must not stage or commit files outside its owned domain. Never
  `git add -A` when the working tree may hold another agent's concurrent work —
  stage explicit paths.
- Shared-interface packages change interface-first: types/contracts land before
  implementation, and the editing agent announces the change.
- A change crossing a domain boundary requires an explicit assignment recorded
  in the task or PR before work begins.
- No agent renames or deletes a shared directory without an ADR.

## Agent instructions

- **Claude** — Guard coherence. Review for drift, duplication, and ADR
  violations. Own ADRs and `/docs`. Do not implement backend services or
  frontend screens. When you spot a cross-domain problem, escalate or assign;
  do not silently fix outside your domain.
- **Codex** — Implement backend and infrastructure within `/services`,
  `/infrastructure`, and backend packages. Do not create frontend code. Do not
  make architectural decisions without an ADR.
- **Composer** — Build frontend and product experience within `/apps` and
  frontend packages. Do not place backend logic in apps. Do not design
  databases or backend APIs.
- **Copilot** — Accelerate local, file-level implementation only. Never
  scaffold new services, make architectural decisions, or act across files
  without a human or owning agent directing it.

## Review triggers

- A fifth agent or a new role is added to the project.
- Domain boundaries cause repeated bottlenecks or hand-off friction.
- The branch strategy changes (e.g. trunk-based development is adopted).

## Related documents

- [0034. Monorepo boundary ownership](0034-monorepo-boundary-ownership.md)
- [.github/instructions/adr-governance.instructions.md](../../.github/instructions/adr-governance.instructions.md)
