# NEXT Platform Governance

> The policy framework and enforcement model that the trust and moderation
> systems execute. Policy is **versioned, mapped, and explainable** — never an
> unwritten judgment call.

## 0. Doctrine

Governance turns values into enforceable, auditable rules without becoming
bureaucracy or censorship. Principles:

- **Policy is code-adjacent** — versioned, reviewed, and referenced by ID, so
  every enforcement action points at the exact rule (and rule _version_) it
  applied.
- **Proportionality** — the response scales to severity and to history; the
  first response is rarely the harshest.
- **Reversibility** — the enforcement ladder favors reversible, expiring actions;
  irreversible actions are rare, human-decided, and reinstatement-bounded.
- **Nuance over blanket rules** — policy encodes context and intent, not just
  surface features.

## 1. Policy framework

### 1.1 Policy versioning

Each policy is a versioned document with a stable `policy_id` and a `version`.
Policies live under `/docs/policies/` (a future companion to this directory).
When a policy changes, a new version is published; **enforcement records pin the
policy version in force at the time of the action** — so a past action is always
interpretable against the rule that actually applied, not today's rule.

### 1.2 Moderation taxonomy

A single hierarchical taxonomy of harm categories — e.g.
`harassment/targeted`, `harassment/coordinated`, `deception/impersonation`,
`deception/synthetic-undisclosed`, `spam/commercial`, `safety/violence`,
`safety/child` (the zero-tolerance branch), `fraud/financial`. Every flag, model
output, and enforcement record references a taxonomy node. The taxonomy is the
shared vocabulary across detectors, reviewers, appeals, and transparency
reports.

### 1.3 Policy → enforcement mapping

A **policy enforcement map** binds each taxonomy node to: a default severity
(S0–S3), an enforcement-ladder ceiling, and whether automated action is
permitted. The map is the bridge from "what was violated" to "what may be done"
— and it is itself versioned and reviewed.

## 2. Severity tiers

Severity (defined in [moderation-pipelines.md](moderation-pipelines.md) §3:
S0 critical → S3 low/borderline) drives **handling speed** and the **enforcement
ceiling**. Severity is not the verdict — a S1-category flag can still be
resolved as "no violation" by review.

## 3. The enforcement ladder

Enforcement escalates. The ladder favors the **least-restrictive effective
action**, and every rung is **disclosed and appealable** ([appeals-system.md](appeals-system.md)).

| Rung | Action                                 | Reversible            | Notes                                              |
| ---- | -------------------------------------- | --------------------- | -------------------------------------------------- |
| 1    | **Warning / nudge**                    | n/a                   | educational; no functional limit                   |
| 2    | **Friction**                           | yes, expiring         | rate limits, posting cooldowns, challenges         |
| 3    | **Feature cooldown**                   | yes, expiring         | temporary loss of a feature (e.g. live, comments)  |
| 4    | **Visibility reduction**               | yes, expiring         | **disclosed** ranking/discovery reduction — see §4 |
| 5    | **Temporary restriction / suspension** | yes, expiring         | account-level, time-boxed                          |
| 6    | **Permanent suspension**               | reinstatement-bounded | human-decided only; never fully automated          |

Rung selection = `f(severity, enforcement history, trust)`. A first S3 is a rung
1–2 matter; a repeated S1 escalates; an S0 jumps the ladder. History's weight
**decays** ([trust-architecture.md](trust-architecture.md) §4) — a user is not
escalated forever for an old, minor, decayed violation.

## 4. Visibility reduction is not shadowbanning

Rung 4 is the dangerous one, so its rules are explicit:

- it is **disclosed** to the affected creator with a notice, a reason, a policy
  ref, and an expiry;
- it is **appealable** like any other action;
- it is **bounded and expiring** — not a permanent silent penalty;
- it is **logged** in the audit trail.

A visibility reduction that is _not_ disclosed is a shadowban, and shadowbanning
is forbidden at NEXT ([appeals-system.md](appeals-system.md) §6). The difference
between a legitimate rung-4 action and a shadowban is _disclosure_ — so
disclosure is mandatory, not optional.

## 5. Governance workflows

- **Policy change** — proposed → reviewed (policy owners + a trust-and-safety
  council) → published as a new version → enforcement map updated → change
  announced. Material policy changes are themselves transparency-reported.
- **Escalation tiers** — L1–L3 automated; L4 frontline human review; a senior
  review tier for S0/S1 and for novel cases; a council tier for precedent-setting
  decisions and policy interpretation.
- **Precedent** — council decisions on novel cases are recorded as
  interpretation notes attached to the relevant policy version, so like cases
  are decided alike.
- **Incident response** — a coordinated-harm or platform-integrity incident
  follows a defined runbook with clear command and post-incident review.

## 6. Proposed service map

This phase is architecture-only. The trust & safety layer is designed as the
following services — `trust-service` and `moderation-service` **exist**; the
rest are **proposed**, to be implemented in a later, separately-assigned phase
and only via the canonical Go service layout ([ADR 0038](../adr/0038-canonical-go-service-layout.md)).

| Service                        | Status            | Responsibility                                              |
| ------------------------------ | ----------------- | ----------------------------------------------------------- |
| `trust-service`                | exists (deep)     | trust score computation + `trust.score.updated` projection  |
| `moderation-service`           | exists (scaffold) | the five-layer moderation pipeline orchestrator             |
| `safety-ingest-service`        | proposed          | L1 realtime detection + flag intake (user reports, signals) |
| `risk-intelligence-service`    | proposed          | behavioral + graph + event-driven abuse detection           |
| `enforcement-service`          | proposed          | the enforcement ladder, action records, notices             |
| `appeals-service`              | proposed          | appeals queues, independent re-review, resolutions          |
| `creator-verification-service` | proposed          | verification facts, authenticity scoring                    |
| `live-safety-service`          | proposed          | the live moderation pipeline + operator console backend     |
| `policy-service`               | proposed          | policy versioning, taxonomy, the enforcement map            |

AI moderation models are **Python `/ai` subsystems** ([ADR 0016](../adr/0016-ai-serving.md)),
consumed by the pipeline as inference contracts — not built into the Go
services. Proposing these services is within this phase's mandate; implementing
them is not.

## 7. Governance events

| Event                          | Producer                       | Consumers                              |
| ------------------------------ | ------------------------------ | -------------------------------------- |
| `moderation.policy.updated.v1` | policy-service (proposed)      | moderation, enforcement, observability |
| `moderation.action.taken.v1`   | enforcement-service (proposed) | trust-service, notification, audit     |
| `audit.privileged.action.v1`   | staff surfaces                 | audit sink (compliance retention)      |

Streams: `moderation.events.v1`, `audit.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).

## 8. Observability

Enforcement volume by taxonomy node and rung; appeal and overturn rates (the
false-positive signal); escalation latency; policy-version adoption; council
decision throughput. These feed the public transparency reports
([appeals-system.md](appeals-system.md) §4).

## Related documents

- [moderation-pipelines.md](moderation-pipelines.md) · [appeals-system.md](appeals-system.md) · [trust-architecture.md](trust-architecture.md) · [recommendation-integration.md](recommendation-integration.md)
