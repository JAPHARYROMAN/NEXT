# NEXT Engineering Governance

The Engineering Operating System of NEXT — the doctrine that lets a
planetary-scale platform, built by humans and AI agents in parallel, evolve fast
without collapsing into chaos.

> NEXT must scale without losing its soul.

## Start here

[**engineering-operating-system.md**](engineering-operating-system.md) is the
umbrella — read it first. It defines the five things governance protects, the
"heavy at boundaries, light everywhere else" principle, the governance stack
(Constitution → ADRs → governance docs → instructions → CI gates), and the
operating loop.

## Documents

| Doc                                                                | Governs                                                                                       |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [engineering-operating-system.md](engineering-operating-system.md) | the umbrella — principles, the governance stack, the operating loop                           |
| [multi-agent-governance.md](multi-agent-governance.md)             | the four agents — domains, escalation, conflict resolution, the override doctrine             |
| [runtime-governance.md](runtime-governance.md)                     | Go / TS / Python / IaC runtime boundaries; the runtime exception process                      |
| [architecture-governance.md](architecture-governance.md)           | when an ADR is mandatory; who approves architecture change; merge blockers; coherence audits  |
| [code-review-doctrine.md](code-review-doctrine.md)                 | PR review, required reviewers, automated gates, merge blockers, quality minimums              |
| [release-governance.md](release-governance.md)                     | release trains, canary, feature flags, rollback, experimentation governance                   |
| [incident-governance.md](incident-governance.md)                   | incident ownership, authority, AI-agent limits, communication, accountability                 |
| [technical-debt-governance.md](technical-debt-governance.md)       | debt classification, severity, expiry, when debt blocks a release                             |
| [ai-agent-permissions.md](ai-agent-permissions.md)                 | the agent permission matrix; what agents may never do autonomously; hallucination containment |
| [organizational-scaling.md](organizational-scaling.md)             | how NEXT engineering scales from a small team to platform divisions without fragmenting       |

## The operating system in one paragraph

Governance weight scales with blast radius — almost none for in-domain
reversible work, heavy at the architecture boundaries where drift and collapse
actually happen. Four AI agents work bounded domains on isolated branches; no
agent commits to `main`, merges a PR, deploys, or makes an irreversible decision
— those route to humans. Architectural change happens as ADRs, in the open;
review enforces the boundaries with a governance checklist and automated gates;
releases ride trains and canary with rollback always one action away; incidents
are met with pre-settled authority; debt is classified, owned, and given an
expiry; and the organization scales onto the architecture's existing boundaries
so it never has to invent structure as it grows. A continuous build → review →
integrate → release → operate → audit loop, checksummed by periodic coherence
audits, keeps the whole coherent.

## What this consolidates

These documents **operationalize** governance already decided — they do not
re-decide it. Where a governance doc could appear to differ from an ADR, the ADR
governs. The sources consolidated here:

- [ADR 0033](../adr/0033-multi-agent-governance.md), [0034](../adr/0034-monorepo-boundary-ownership.md)
  — the multi-agent model and directory ownership.
- [ADR 0036–0039](../adr/README.md) — event topology, compute layout, service
  layout, schema source of truth.
- The [ADR system](../adr/README.md) and the
  [adr-governance instruction](../../.github/instructions/adr-governance.instructions.md).
- The [PR template](../../.github/pull_request_template.md) and the
  [technical-debt register](../technical-debt/technical-debt-register.md).
- The [resilience incident](../resilience/incident-response.md) and
  [SRE](../resilience/sre-doctrine.md) doctrine.
- The [Phase 10 coherence audit](../audits/phase-10-system-integration-audit.md).

## Issue templates

`.github/ISSUE_TEMPLATE/` carries governance-aware issue templates — an ADR
proposal, an architecture-change request, a technical-debt item, and an incident
report — so that governance-relevant work enters the system in a structured,
routable form.

## Scope

Governance and process architecture only — no services, infrastructure, or
application code. The EOS is a **living system**: revised like code, flagged for
process theater and cut where it does not earn its cost, and reviewed each
integration phase.
