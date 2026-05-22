# Incident Governance

> Who is in charge when something breaks, what authority they hold, and the
> limits on AI-agent participation. This is the **governance** layer over the
> operational incident process.

> The operational mechanics — severity tiers, the incident lifecycle, roles,
> mitigation ladder, post-incident review — live in
> [docs/resilience/incident-response.md](../resilience/incident-response.md).
> This document governs _authority and accountability_ during an incident; it
> does not restate the runbook.

## 0. Principle

An incident is the worst time to be deciding _who decides_. Incident governance
settles authority **in advance** so that, under pressure, the response is
execution — not a debate about who is allowed to act.

## 1. Incident ownership

- Every incident has exactly **one Incident Commander (IC)** — a human — who owns
  the incident end to end ([docs/resilience/incident-response.md](../resilience/incident-response.md)
  §2). The IC coordinates; the IC does not need to be the person debugging.
- The IC is drawn from the **on-call rotation of the owning domain**
  ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) for a single-domain
  incident; a cross-domain or platform-wide incident escalates to a senior IC.
- Incident ownership is **explicit and announced** at declaration — the incident
  channel names the IC. An incident with no named IC is a governance failure.

## 2. Authority during an incident

The IC holds, for the duration of the incident, authority that overrides normal
process — because speed of mitigation outranks normal ceremony:

| Authority                                 | Held by                  | Notes                                                                            |
| ----------------------------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| Declare / set / revise severity           | IC                       | severity can move up or down as facts change                                     |
| Order a rollback                          | IC or release owner      | **never blocked by process** ([release-governance.md](release-governance.md) §6) |
| Engage degraded mode / shed load          | IC                       | per [graceful-degradation](../resilience/graceful-degradation.md)                |
| Order a regional failover                 | IC + the DR runbook      | [disaster-recovery](../resilience/disaster-recovery.md)                          |
| Pull in any domain expert                 | IC                       | domain owners respond to an IC page                                              |
| Approve an out-of-train hotfix            | IC + human maintainer    | the expedited release path                                                       |
| Authorize external / public communication | Communications lead + IC | §4                                                                               |

This authority is **time-boxed to the incident** and dissolves at resolution.
Normal governance resumes — the hotfix shipped under incident authority still
gets its post-hoc review and ADR if it changed architecture.

## 3. AI-agent participation limits

AI agents are valuable in incidents — fast diagnosis, log correlation, drafting
fixes, surfacing relevant ADRs and runbooks. But their participation is
**bounded** ([ai-agent-permissions.md](ai-agent-permissions.md)):

- An agent may: **diagnose**, **correlate signals**, **propose** mitigations,
  **draft** a fix or a rollback PR, **surface** relevant docs.
- An agent may **not**: be the Incident Commander; be the authoritative
  decision-maker; deploy, roll back, or fail over on its own authority; approve
  its own fix; communicate externally.
- Every agent action in an incident is **executed under, and attributed to, a
  human's authority** — the IC or a named operator.
- An agent that is uncertain **escalates to the IC** rather than acting; under
  incident pressure, a confident-but-wrong agent is especially dangerous, so the
  bias toward escalation is stronger, not weaker.

The rule: agents make the incident _faster to understand and faster to fix_;
humans remain the ones who _decide and act_.

## 4. Communication governance

- **Internal** — the incident channel is the single source of truth; a scribe
  keeps the timeline; the IC sets the update cadence.
- **External** — public/status-page communication for SEV1/SEV2 is authored by
  the communications lead, approved by the IC, and is **honest over optical** —
  plain language, real impact, next-update time. No agent communicates
  externally.
- **Creator communication** — incidents affecting creators (upload, monetization,
  live, reach) trigger direct creator communication; creator continuity is an
  explicit incident concern ([docs/resilience/incident-response.md](../resilience/incident-response.md) §6).
- **Regulatory / legal** — incidents with legal or safety dimensions (data,
  child-safety, security breach) follow the restricted escalation path and
  involve the relevant council; this is never agent-handled.

## 5. Rollback authority

Rollback is governed loosely _on purpose_ — the danger is rolling back too
**slowly**, not too eagerly:

- the **IC or the release owner** may order a rollback with **no further
  approval**;
- "roll back first, root-cause after" is doctrine
  ([release-governance.md](release-governance.md) §6);
- an agent may _prepare_ a rollback (draft the revert PR, identify the bad
  deploy) but a human triggers it.

## 6. Post-incident accountability

- Every SEV1/SEV2 gets a **blameless post-incident review**
  ([docs/resilience/incident-response.md](../resilience/incident-response.md) §7).
- The review's output is **systemic action items**, each with an owner and a due
  date, tracked into the [technical-debt register](../technical-debt/technical-debt-register.md)
  where architectural.
- An incident that revealed a governance gap (a missing ADR, an unclear
  ownership, a too-slow gate) feeds a **governance** fix — the EOS is amended,
  not just the code.
- Blameless means the artifact names _systemic causes_, never individuals; a
  human or agent operating in good faith inside this system is not the bug.

## 7. The governance/resilience boundary

This document and [docs/resilience/incident-response.md](../resilience/incident-response.md)
are deliberately split:

- **resilience/incident-response** — the _how_: severities, lifecycle, roles,
  mitigation ladder, the runbook.
- **governance/incident-governance** — the _who decides and with what authority_:
  ownership, authority scope, AI-agent limits, communication and rollback
  authority, post-incident accountability.

Together they ensure an incident is met with both a rehearsed procedure and a
settled chain of authority.

## Related documents

- [docs/resilience/incident-response.md](../resilience/incident-response.md) · [docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) · [release-governance.md](release-governance.md) · [ai-agent-permissions.md](ai-agent-permissions.md)
