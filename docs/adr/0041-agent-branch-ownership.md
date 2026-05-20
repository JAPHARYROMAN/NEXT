# 0041. Agent branch ownership

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture
- **Tags**: governance, multi-agent, git, process

## Context

NEXT is built by four AI agents working in parallel — Claude, Codex, Composer,
Copilot — plus human contributors, against a **single shared working tree**.
The Phase 11 exit audit found the failure mode this creates: stabilization work
spanning backend, infra, hygiene, and proto sat uncommitted on whichever branch
happened to be checked out (`agent/composer-frontend`), at risk of being swept
into one mixed-domain mega-commit by a stray `git add .`.

`docs/git/safe-commit-workflow.md` already names per-agent branches, and
[ADR 0034](0034-monorepo-boundary-ownership.md) defines directory ownership, but
no ADR makes the **branch**-to-**agent**-to-**directory** mapping authoritative.
Phase 11.5 also surfaced that `agent/copilot-utilities` did not exist and that
Codex's stabilization fixes were not on `agent/codex-backend`.

## Decision

Each agent commits **only** to its own branch, and each branch carries **only**
its agent's directory domain:

| Agent | Branch | Owns (commit scope) |
|---|---|---|
| **Claude** | `agent/claude-architecture` | `docs/**`, `docs/adr/**`, ADRs, audits; `.github/` governance templates; `packages/config`, `packages/types`, `packages/events`; root architecture config coherence (`go.work`, `buf.yaml`, `turbo.json`, `tsconfig.base.json`) as cross-cutting reviewer. |
| **Codex** | `agent/codex-backend` (+ `agent/codex-backend-phase*` worktrees) | `services/**` (Go service logic), `infrastructure/**`, `gen/go/go.mod`+`go.sum`, `packages/go/**`, `packages/database`, `packages/auth-sdk`, `packages/telemetry`, `packages/rust/**`, `tests/backend/**`, backend stabilization fixes. |
| **Composer** | `agent/composer-frontend` | `apps/**`, `packages/*-ui`, `packages/design-system`, `packages/animation-system`, `packages/layout-engine`, `packages/frontend-utils`, `packages/icons`, `packages/ui`, frontend `pnpm-lock.yaml` + `package.json` churn. |
| **Copilot** | `agent/copilot-utilities` | small hygiene / tooling / test fixes: `scripts/**`, `.husky/**`, `.gitignore`, `.mise.toml`, lint/format configs, isolated test additions. No product logic. |

Shared rails: **`develop`** is the integration branch; **`main`** is
production-stable only — no agent commits directly to either. Branch merges to
`develop` happen only after CI is green and with human go-ahead.

`agent/copilot-utilities` **must exist**; if absent, it is created off the
current `develop` (or `main`) tip before Copilot commits.

## Rationale

A shared working tree with four writers only stays coherent if the *branch* an
agent commits to is a fixed function of *who the agent is*, and the *files* it
stages are a fixed function of *its directory domain*. Decoupling the two — e.g.
committing backend files while `agent/composer-frontend` is checked out — is the
exact contamination Phase 11 caught. Making the mapping an Accepted ADR lets a
reviewer (or CI) reject a commit whose paths do not match its branch.

Branch-per-agent also keeps `git blame`, integration review at `develop`, and
revert granularity clean: a domain can be rolled back without disturbing others.

## Alternatives considered

- **One shared feature branch for all agents** — no cross-branch coordination,
  but every commit is mixed-domain; integration review and selective revert
  become impossible. Rejected — it is the status quo Phase 11 flagged.
- **A branch per phase instead of per agent** — aligns with the roadmap, but a
  single phase still spans all four domains, so mixed-domain commits return.
  Rejected.
- **Per-agent git worktrees only (no branch rule)** — worktrees help isolate
  checkouts, but without a branch-ownership rule an agent can still commit the
  wrong domain. Worktrees are an *aid* to this ADR, not a replacement.

## Consequences

### Positive

- Every commit's paths are predictable from its branch; contamination is
  detectable mechanically.
- Integration review at `develop` is per-domain and tractable.
- Selective revert and clean `git blame` per domain.

### Negative

- Cross-cutting changes (e.g. a proto contract change that touches a service,
  an event schema, tests, and a frontend client) must be split across branches
  and coordinated — more process for genuinely cross-domain work.

### Neutral / open questions

- Shared contract files (`*.proto`, `packages/events` schemas, shared package
  public APIs) are Claude-reviewed; the owning agent commits, Claude integrates.
- When an agent must edit outside its domain, it hands off rather than commits.

## Implementation rules

- An agent runs `git branch --show-current` before staging; if it is not the
  agent's branch, it stops and does not commit.
- Staging is by explicit path only — never `git add .` / `-A` / `--all`
  (`docs/git/safe-commit-workflow.md`).
- No commit's staged paths may fall outside the committing branch's domain row
  above. A commit crossing 3+ domains is forbidden.
- `pnpm-lock.yaml` is committed only on `agent/composer-frontend`, in the same
  commit as the `package.json` change that produced it.
- `agent/copilot-utilities` exists; create it if missing before Copilot commits.
- No direct commits to `develop` or `main`.

## Agent instructions

- **Claude** — Commit only to `agent/claude-architecture`; stage only `docs/**`,
  ADRs, audits, `.github/` governance, and `packages/{config,types,events}`. Use
  a git worktree to commit when another agent's branch is checked out, rather
  than switching the shared tree. Review cross-domain contract changes.
- **Codex** — Commit only to `agent/codex-backend`; move stranded backend/infra
  stabilization WIP onto it. Never commit on another agent's branch.
- **Composer** — Commit only to `agent/composer-frontend`; push the branch so
  it has an upstream. Frontend files and lockfile only.
- **Copilot** — Commit only to `agent/copilot-utilities` (create it if absent);
  hygiene/tooling/test fixes only, no product logic.

## Review triggers

- A fifth agent or a human contributor stream is added.
- The roadmap moves to trunk-based development and per-agent branches are
  retired.
- Cross-domain change volume makes branch-splitting overhead unacceptable.

## Related documents

- [0034. Monorepo boundary ownership](0034-monorepo-boundary-ownership.md)
- `docs/git/safe-commit-workflow.md` — operational companion
- `docs/git/pre-push-checklist.md`
- `docs/governance/multi-agent-governance.md`
- `PHASE_11_EXIT_AUDIT_CLAUDE.md` — Gate 8, which this ADR resolves
