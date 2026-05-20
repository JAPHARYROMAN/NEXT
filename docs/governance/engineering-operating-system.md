# NEXT Engineering Operating System

> How NEXT is built — the doctrine that lets a platform of this size, built by
> humans and AI agents in parallel, evolve fast without collapsing into chaos.
> This is the operating system of the project itself.

## 0. Purpose

NEXT must scale — in surface area, in contributors, in agents — **without
architecture collapse, cultural decay, agent chaos, runaway complexity, or
organizational fragmentation**. The Engineering Operating System (EOS) is the
standing answer to "how". It is not process for its own sake; every rule here
exists to protect one of five things.

## 1. The five things governance protects

| #   | Protect                          | Against                                    |
| --- | -------------------------------- | ------------------------------------------ |
| 1   | **Speed**                        | bureaucratic paralysis, process theater    |
| 2   | **Creativity & experimentation** | architecture dictatorship, fear of change  |
| 3   | **Coherence**                    | drift, duplication, undocumented decisions |
| 4   | **Resilience & quality**         | shortcuts that ship fragility              |
| 5   | **Humanity**                     | optimizing the platform's soul away        |

A governance rule that does not visibly serve one of these is **process
theater** and is deleted. Governance that _blocks_ one of these to serve another
is a bug to be fixed, not a tradeoff to be accepted.

## 2. The governance principle: heavy at boundaries, light everywhere else

The core design of the EOS:

> **Governance weight scales with blast radius.** A change inside one service,
> in one domain, reversible, touching no contract — almost no governance. A
> change to a runtime, an event contract, a cross-service boundary, or a shared
> package — heavy governance: an ADR, review, escalation.

Most work is light-touch. Governance concentrates at the _architecture
boundaries_, because that is the only place drift and collapse actually happen.
This is what keeps speed and coherence from being a trade.

## 3. The governance stack

NEXT's governance is layered. Each layer is more specific and more enforceable
than the one above it.

```
 Constitution ........... the values — why NEXT exists, what it must never become
        │
 ADRs .................. binding architectural decisions (docs/adr) — the law
        │
 Governance docs ....... this directory — how the law is operated
        │
 Agent instructions .... .github/instructions — always-on directives for agents
        │
 CI gates + CODEOWNERS . mechanical enforcement — what a machine checks
```

- Higher layers **govern** lower layers; lower layers **enforce** higher ones.
- A conflict is resolved upward: the Constitution wins over an ADR, an ADR wins
  over a governance doc, a governance doc wins over an instruction.
- Nothing in a lower layer may contradict a higher one; if it must, the higher
  layer is amended first (a superseding ADR, a constitutional change).

## 4. The EOS documents

This directory is the "Governance docs" layer. Ten documents:

| Doc                                                                | Governs                                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [multi-agent-governance.md](multi-agent-governance.md)             | the four agents — domains, escalation, conflict resolution, override       |
| [runtime-governance.md](runtime-governance.md)                     | Go / TS / Python / IaC runtime boundaries + the exception process          |
| [architecture-governance.md](architecture-governance.md)           | when an ADR is mandatory; who approves architecture change; merge blockers |
| [code-review-doctrine.md](code-review-doctrine.md)                 | PR review, required reviewers, automated gates, merge blockers             |
| [release-governance.md](release-governance.md)                     | release trains, canary, feature flags, rollback, multi-region rollout      |
| [incident-governance.md](incident-governance.md)                   | incident ownership, authority, AI-agent limits, public comms               |
| [technical-debt-governance.md](technical-debt-governance.md)       | debt classification, severity, expiry, when debt blocks a release          |
| [ai-agent-permissions.md](ai-agent-permissions.md)                 | the agent permission matrix; what agents may never do autonomously         |
| [organizational-scaling.md](organizational-scaling.md)             | how NEXT engineering evolves from a small team to platform divisions       |
| [engineering-operating-system.md](engineering-operating-system.md) | this document — the umbrella                                               |

## 5. What is already in force

The EOS is not invented here from scratch — it **consolidates and operationalizes**
governance already decided:

- [ADR 0033](../adr/0033-multi-agent-governance.md) — the multi-agent model.
- [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) — directory ownership.
- [ADR 0036–0039](../adr/README.md) — event topology, compute layout, service
  layout, schema source of truth.
- The ADR system + [its README](../adr/README.md) — the ADR lifecycle.
- [.github/instructions/adr-governance](../../.github/instructions/adr-governance.instructions.md)
  — the always-on ADR directive.
- [.github/pull_request_template.md](../../.github/pull_request_template.md) —
  the governance checklist.
- The [technical-debt register](../technical-debt/technical-debt-register.md)
  and the Phase 10 [coherence audit](../audits/phase-10-system-integration-audit.md).
- The [resilience incident doctrine](../resilience/incident-response.md) and
  [SRE doctrine](../resilience/sre-doctrine.md).

These EOS documents pull that scattered governance into one coherent, navigable
operating system. Where an EOS doc and an ADR could appear to differ, **the ADR
governs** and the EOS doc is corrected.

## 6. The operating loop

NEXT runs a continuous loop, not a one-time setup:

```
 build ──▶ review (gates + CODEOWNERS) ──▶ integrate (develop) ──▶ release (trains, canary)
   ▲                                                                      │
   │                                                                      ▼
 audit ◀── technical-debt register ◀── coherence audit ◀── incident review ◀── operate
```

- **Build** under the agent/ownership model.
- **Review** against the code-review doctrine and automated gates.
- **Integrate** to `develop`; **release** via trains and canary.
- **Operate** under the SRE + incident doctrine.
- **Audit** for coherence and debt; findings feed the register; the register
  feeds the next build cycle.

Coherence is maintained by the _loop_, not by any single gate. A periodic
coherence audit ([architecture-governance.md](architecture-governance.md)) is
the loop's checksum.

## 7. The anti-bureaucracy clause

The EOS is itself governed by principle 1 (speed) and principle 2 (creativity).
Concretely:

- Any contributor or agent may flag a governance rule as **process theater** —
  cost without a protected value. Flagged rules are reviewed and cut or fixed.
- Governance is **revised like code** — proposed, reviewed, versioned. The EOS
  is a living system, not a sacred text.
- The default for in-domain, reversible work is **trust the owner** — light
  review, no ceremony. Heavy governance is the exception, reserved for
  architecture boundaries (§2).
- "We need a process for this" is a claim that must be justified by a blast
  radius. Most things do not need a new process.

NEXT must scale without losing its soul. A governance system that smothered
speed and creativity to get coherence would have failed at exactly the thing it
exists to do.

## Related documents

- The NEXT Constitution · [ADR system](../adr/README.md) · every doc in this directory · [docs/resilience](../resilience/README.md) · [docs/roadmap](../roadmap/README.md)
