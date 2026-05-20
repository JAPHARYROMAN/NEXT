# Organizational Scaling

> How NEXT engineering grows — from a small founder-led team with four AI agents
> to a multi-division platform organization — without silos, duplicated
> infrastructure, or cultural fragmentation.

## 0. Principle

Most engineering organizations fragment as they scale: divisions form, each
builds its own infrastructure, conventions diverge, and the platform becomes a
federation of incompatible fiefdoms. NEXT's defense is that **the coordination
substrate is already built** — the ADR system, the ownership map, the coherence
audits, the EOS. The organization scales _onto an existing skeleton_, rather
than improvising structure as it grows.

## 1. The scaling stages

### Stage 1 — Founder-led + agents (now)

A small human team, founder-led architecture, and four AI agents (Claude,
Codex, Composer, Copilot) doing the bulk of construction. Coordination is the
EOS itself: ADRs, ownership boundaries ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)),
the branch model, coherence audits.

### Stage 2 — Domain pods

As humans join, they organize into **pods aligned to the existing domain
boundaries** — not to new ad-hoc structures. The domains already exist; pods
staff them:

| Pod                | Domain (already bounded)                             |
| ------------------ | ---------------------------------------------------- |
| Media pod          | the media engine — upload, transcode, playback, live |
| Discovery pod      | recommendation, feed, ranking, search                |
| Trust & Safety pod | trust, moderation, integrity                         |
| Identity pod       | auth, profile, sessions, the identity ecosystem      |
| Infrastructure pod | platform, infra, observability, resilience           |
| Frontend pod       | apps, the UI/design-system package family            |

Each pod inherits a domain's ownership, its ADRs, and its agents — a pod is a
human team _plus_ the agents already working that domain.

### Stage 3 — Platform divisions

At larger scale, pods consolidate into **divisions**, still on the same
boundaries:

- **Media division** · **Discovery division** · **Trust & Safety division** ·
  **Creator Systems division** · **Infrastructure division** ·
  **AI Research group**.

Divisions own their domains end to end; the cross-division contracts are exactly
the contracts that already exist — events, proto schemas, service APIs, shared
packages.

## 2. Why the org boundaries are the architecture boundaries

NEXT deliberately makes **organizational boundaries equal architectural
boundaries** (a deliberate application of the inverse of Conway's law):

- a team owns a domain that is _already_ a bounded part of the system;
- the interfaces between teams are _already_ defined — event contracts, proto
  schemas, service APIs;
- so a new division does not invent a new seam — it staffs an existing one.

This is the structural reason scaling does not fragment NEXT: there is no point
at which the org must "figure out how the pieces fit", because the pieces and
their fit are already specified by the architecture.

## 3. Agents and humans scale together

The four-agent model ([multi-agent-governance.md](multi-agent-governance.md)) is
not replaced as humans arrive — it **composes** with them:

- Each pod/division has both human engineers and the agents working its domain.
- Agents accelerate; humans hold authority, judgment, and the irreversible
  decisions ([ai-agent-permissions.md](ai-agent-permissions.md)).
- The agent ownership map and the human org chart are the **same map** — Codex's
  domain is the Backend/Infra division's domain; Composer's is the Frontend
  division's; Claude's architecture role becomes a cross-division architecture
  function.
- Adding humans does not change _who owns what_ — it changes _how much capacity_
  each domain has.

## 4. The anti-fragmentation mechanisms

Specific mechanisms that hold coherence as the org grows:

| Risk                                                                   | Mechanism                                                                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Silos** — divisions stop talking                                     | shared event contracts + the ADR system are the forced common language; cross-domain change requires recorded assignment                                           |
| **Duplicated infrastructure** — each division rebuilds the same thing  | shared packages + a single Infrastructure division; the coherence audit catches duplication ([Phase 10 found exactly this](../audits/multi-agent-drift-report.md)) |
| **Convention drift** — divisions diverge in how they build             | the canonical service layout ([ADR 0038](../adr/0038-canonical-go-service-layout.md)), runtime governance, the EOS                                                 |
| **Cultural fragmentation** — divisions lose the shared values          | the Constitution; the architecture-and-coherence function spans all divisions                                                                                      |
| **Decision sprawl** — the same thing decided differently in two places | the ADR system is one global decision log, not per-division                                                                                                        |

## 5. The cross-cutting functions

Some functions are deliberately **not** owned by a single domain division —
they span all of them, because their job is the whole:

- **Architecture & coherence** (Claude's role, scaling to an architecture
  function) — owns the ADR system, runs coherence audits, governs cross-division
  change.
- **SRE / reliability** — owns the SLO/error-budget discipline and incident
  process across divisions ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md)).
- **Security & Trust governance** — owns platform-wide safety and the
  algorithmic-accountability function ([docs/roadmap/platform-governance-evolution.md](../roadmap/platform-governance-evolution.md)).

These cross-cutting functions are the connective tissue that keeps divisions a
_platform_ rather than a _portfolio_.

## 6. Scaling the governance itself

The EOS scales with the org:

- **ADRs** — one global log; more divisions write more ADRs, but the numbering,
  lifecycle, and authority are unchanged.
- **Ownership map** ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) — new
  divisions get rows; the rule "every directory has one owner" is invariant.
- **Coherence audits** — run more often as the org grows; they are the
  organization's checksum.
- **The EOS documents** — revised like code as the org learns; never frozen.

## 7. What must not happen

- A division standing up its **own runtime, own event bus, or own infra** —
  runtime and infra governance forbid it ([runtime-governance.md](runtime-governance.md)).
- A division **forking** a shared package instead of evolving it interface-first.
- Architecture decisions made **inside one division** that affect others without
  an ADR.
- The org chart and the architecture drifting apart — if they ever diverge, the
  org is realigned to the architecture, not the reverse.

## 8. The end state

A multi-division platform organization where every division owns a coherent
architectural domain, every interface between them is an explicit contract,
every consequential decision is an ADR in one shared log, and a cross-cutting
architecture function continuously verifies the whole still hangs together.
NEXT scales to that without a single re-org that "fixes the architecture" —
because the architecture _is_ the org design, from Stage 1 onward.

## Related documents

- [multi-agent-governance.md](multi-agent-governance.md) · [architecture-governance.md](architecture-governance.md) · [engineering-operating-system.md](engineering-operating-system.md)
- [ADR 0033](../adr/0033-multi-agent-governance.md) · [ADR 0034](../adr/0034-monorepo-boundary-ownership.md) · [docs/roadmap/10-year-ecosystem-roadmap.md](../roadmap/10-year-ecosystem-roadmap.md)
