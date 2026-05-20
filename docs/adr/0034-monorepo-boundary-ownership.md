# 0034. Monorepo boundary ownership

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture
- **Tags**: governance, monorepo, ai-agents

## Context

[ADR 0033](0033-multi-agent-governance.md) establishes that each agent owns a
bounded domain. That model is only enforceable if "domain" is defined precisely.
"Edit only what you own" is meaningless without a directory-level map of who
owns what. This ADR is that map.

## Decision

Every top-level directory of the NEXT monorepo has exactly one owning agent.
The owner is the only agent that modifies that directory without an explicit
cross-domain assignment.

| Directory                         | Owner    | Contents                                              |
| --------------------------------- | -------- | ----------------------------------------------------- |
| `/services`                       | Codex    | Go backend services — gRPC, Kafka, HTTP               |
| `/apps`                           | Composer | Next.js / React applications                          |
| `/packages`                       | shared¹  | Cross-cutting libraries (TS, Go, Rust, Python)        |
| `/ai`                             | Codex²   | Python AI/ML pipelines, training, inference           |
| `/infrastructure`                 | Codex    | Terraform, Kubernetes, Helm, observability config     |
| `/docs`                           | Claude   | Architecture docs, ADRs, runbooks                     |
| `/.github/instructions`           | Claude   | Agent governance instructions                         |
| `/.github` (workflows, templates) | Codex    | CI/CD, PR template (PR template co-owned with Claude) |

¹ `/packages` is **co-owned by sub-tree**: `/packages/ui`, `/packages/design-system`,
and other frontend packages → Composer; `/packages/go/*` and backend SDKs →
Codex; `/packages/events`, `/packages/types`, `/packages/config` are
shared-interface packages governed by the interface-first protocol.

² `/ai` is owned by the agent assigned the relevant AI phase; Codex by default.
Claude owns the architecture docs that describe `/ai`, not its implementation.

## Rationale

Directory boundaries are unambiguous in a way feature boundaries are not — a
file is in exactly one directory, so ownership of any file is decidable by path
alone. That decidability is what lets the rule "do not edit outside your domain"
be checked mechanically, by a reviewer or by CI, rather than argued.

## Alternatives considered

- **Ownership by language** (Go → Codex, TS → Composer) — breaks down for
  `/packages` which is polyglot, and for `/ai` (Python) vs `/services` (Go) both
  being Codex. Directory ownership subsumes it more cleanly. Rejected.
- **Per-file `CODEOWNERS` only** — GitHub `CODEOWNERS` enforces review but not
  the agent-domain model; it is the enforcement mechanism, not the source of
  truth. Kept as enforcement, not as the decision record.

## Consequences

### Positive

- Ownership of any path is decidable without discussion.
- `CODEOWNERS` can mechanically enforce this map at PR time.
- New top-level directories must be assigned an owner — surfaced by this ADR.

### Negative

- Polyglot `/packages` needs the sub-tree carve-out, a small exception to the
  otherwise clean top-level rule.

### Neutral / open questions

- If `/ai` work grows large enough to need a dedicated agent, the `/ai` row is
  reassigned (a review trigger below).

## Implementation rules

- A change to a directory is made by its owner, or by an agent holding an
  explicit assignment for that change.
- `.github/CODEOWNERS` must mirror this table; the two are kept in sync.
- A new top-level directory may not be merged without adding a row here.
- The shared-interface packages (`/packages/events`, `/packages/types`,
  `/packages/config`) follow the interface-first protocol of [ADR 0033](0033-multi-agent-governance.md).

## Agent instructions

- **Claude** — Own `/docs` and `/.github/instructions`. Keep this table and
  `CODEOWNERS` in sync. When reviewing a PR, reject changes that touch a
  directory the authoring agent does not own without a recorded assignment.
- **Codex** — Own `/services`, `/infrastructure`, `/ai`, backend `/packages`
  sub-trees, and `/.github` CI. Do not edit `/apps` or `/docs`.
- **Composer** — Own `/apps` and frontend `/packages` sub-trees. Do not edit
  `/services`, `/infrastructure`, or `/ai`.
- **Copilot** — Has no directory ownership; assists within whatever file the
  owning agent is already editing.

## Review triggers

- A new top-level directory is added.
- `/ai` grows enough to warrant a dedicated owning agent.
- The agent roster changes (see [ADR 0033](0033-multi-agent-governance.md)).

## Related documents

- [0033. Multi-agent governance model](0033-multi-agent-governance.md)
- [.github/CODEOWNERS](../../.github/CODEOWNERS)
- [.github/instructions/adr-governance.instructions.md](../../.github/instructions/adr-governance.instructions.md)
