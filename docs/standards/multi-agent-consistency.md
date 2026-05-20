# Multi-Agent Consistency Rules

> The standards-layer rules that keep four AI agents producing **one coherent
> codebase**. This document is the consistency _standard_; the full governance
> model is [docs/governance/multi-agent-governance.md](../governance/multi-agent-governance.md)
> and the permission matrix is [docs/governance/ai-agent-permissions.md](../governance/ai-agent-permissions.md).
> Where they could appear to differ, those governance docs and
> [ADR 0033](../adr/0033-multi-agent-governance.md) / [ADR 0034](../adr/0034-monorepo-boundary-ownership.md)
> govern.

Status: **binding**.

## 1. The agents and their domains

| Agent        | Domain                                                         | Builds                                    |
| ------------ | -------------------------------------------------------------- | ----------------------------------------- |
| **Claude**   | `/docs`, ADRs, governance, standards                           | architecture, coherence, audits, review   |
| **Codex**    | `/services`, `/infrastructure`, `/ai`, backend `/packages`, CI | backend + infra implementation            |
| **Composer** | `/apps`, frontend `/packages`                                  | frontend + product experience             |
| **Copilot**  | local file-level only                                          | implementation acceleration; no ownership |

## 2. Ownership boundaries

- An agent edits **only its owned directories** ([monorepo-governance.md](monorepo-governance.md) §1,
  [ADR 0034](../adr/0034-monorepo-boundary-ownership.md)).
- Editing another domain requires a **recorded cross-domain assignment** made
  _before_ work starts.
- An agent commits **only files in its domain** — never `git add -A` when the
  working tree may hold another agent's concurrent work. (The Phase 10 audit
  documented exactly this drift, DR-3.)
- Each agent works on its branch (`agent/<agent>-<domain>`); `develop` is
  integration; no agent commits to `main`.

## 3. Consistency — every agent applies the same standards

The reason this directory exists: **all four agents build to the same
standards.** An agent does not have a "house style". Codex's services follow
[go-service-standards.md](go-service-standards.md); Composer's apps follow
[frontend-standards.md](frontend-standards.md); every agent follows
[naming-conventions.md](naming-conventions.md), [event-standards.md](event-standards.md),
[observability-standards.md](observability-standards.md),
[security-standards.md](security-standards.md). A standard is agent-agnostic by
design — that is what makes a multi-agent codebase look like one author.

## 4. Escalation rules

An agent **escalates instead of guessing** when:

- a task conflicts with an ADR, a standard, or the Constitution;
- two ADRs / standards conflict, or none covers the decision;
- work must cross a domain boundary with no assignment;
- the agent is uncertain whether a change needs an ADR (default: **yes**).

Path: owning agent → Claude (architecture) → human maintainer. Escalation is the
correct action; a confident guess is the failure
([docs/governance/multi-agent-governance.md](../governance/multi-agent-governance.md) §6).

## 5. Prohibited autonomous actions

No agent, regardless of domain, may autonomously
([docs/governance/ai-agent-permissions.md](../governance/ai-agent-permissions.md) §3):

- commit to `main` or `develop`, merge a PR, or deploy;
- run a destructive/irreversible operation (force-push, history rewrite, data
  drop) without explicit human approval;
- introduce a runtime, datastore, or messaging system without an ADR + human
  sign-off;
- change a security/auth boundary without governance + human sign-off;
- disable or bypass a safety/quality gate;
- act as the final authority in a production incident;
- edit another agent's domain without a recorded assignment.

## 6. Architectural override authority

- **Claude** holds architectural authority — it may block a change that violates
  an ADR, a standard, or a runtime/domain boundary, **citing the specific rule**.
- That authority is **bounded** — Claude may not block correct, in-domain work
  on preference; decisions are made as ADRs in the open, not as private vetoes.
- A disputed block escalates to the **human maintainer**, the final authority
  ([docs/governance/multi-agent-governance.md](../governance/multi-agent-governance.md) §8).

## 7. Review requirements

- Every change is reviewed; reviewer requirements scale with blast radius
  ([docs/governance/code-review-doctrine.md](../governance/code-review-doctrine.md)).
- Review **assumes the author may be confidently wrong** — claims that a file,
  function, or flag exists are verified, not trusted. This is the structural
  defense against AI architectural hallucination.
- An AI-authored architectural change gets Claude + human scrutiny; an
  AI-authored in-domain change gets a normal pass.
- The human maintainer is the final approver for merge.

## 8. Hallucination containment

Consistency across agents is also a _correctness_ mechanism — it contains the
one failure mode unique to AI authorship:

- **bounded domains** cap an erroneous agent's blast radius;
- **branch isolation** keeps an error off `main` until reviewed;
- **ADRs and standards as the source of truth** — an agent consults the
  ADR/standard, never its own recollection, for an architectural fact;
- **verify before acting** — "X exists" is checked against the repo;
- **escalate over invent** (§4).

## 9. Prohibited patterns

- ✗ An agent editing outside its domain without an assignment.
- ✗ `git add -A` across a mixed multi-agent working tree.
- ✗ An agent inventing an architectural fact instead of checking the ADR/standard.
- ✗ An agent applying a personal "house style" instead of the shared standards.
- ✗ Any action on the §5 prohibited list.
- ✗ Claude blocking in-domain work on preference rather than a cited rule.

## Related

- [docs/governance/multi-agent-governance.md](../governance/multi-agent-governance.md) · [docs/governance/ai-agent-permissions.md](../governance/ai-agent-permissions.md) · [ADR 0033](../adr/0033-multi-agent-governance.md) · [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) · [enforcement-mechanisms.md](enforcement-mechanisms.md)
