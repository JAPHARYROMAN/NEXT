# NEXT Incident Response

> When something breaks, the platform's recovery should be as engineered as its
> architecture. Incident response at NEXT is **classified, rehearsed, and
> blameless** — calm under pressure because the process was decided in advance.

## 0. Doctrine

- **Decide the process before the incident.** Roles, severities, and comms are
  pre-agreed; an incident is execution, not invention.
- **Mitigate first, diagnose second.** The first goal is to stop user harm —
  restore service, then find the root cause.
- **One commander.** Every incident has a single Incident Commander who
  coordinates; everyone else executes.
- **Blameless.** The output of a review is systemic fixes. Humans operating a
  complex system in good faith are not the bug.

## 1. Incident severity classification

| Severity | Definition                                              | Examples                                                                   | Response                                          |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| **SEV1** | Critical — platform-wide user harm                      | global playback failure, auth down, region loss with failed failover       | full war room; all-hands; exec + public comms     |
| **SEV2** | Major — significant degradation or a major feature down | recommendations down platform-wide, one region degraded, event-bus backlog | war room; domain on-call + IC; status-page update |
| **SEV3** | Minor — limited or degraded, with a working fallback    | a T2 service degraded to fallback, elevated error rate within budget       | domain on-call handles; tracked; no war room      |
| **SEV4** | Low — cosmetic or contained, no meaningful user impact  | a dashboard panel broken, a non-urgent batch job failed                    | normal queue                                      |

Severity is assigned at declaration and **can be revised** — an incident that
worsens is upgraded, freeing the larger response; one that proves contained is
downgraded.

## 2. Incident roles

| Role                        | Responsibility                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Incident Commander (IC)** | owns the incident; coordinates; makes the calls; is _not_ hands-on-keyboard                    |
| **Operations lead**         | drives the technical mitigation                                                                |
| **Communications lead**     | status page, internal updates, stakeholder comms                                               |
| **Scribe**                  | maintains the incident timeline as it happens                                                  |
| **Subject experts**         | domain owners (per [ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) pulled in as needed |

For SEV3/SEV4 one person may hold several roles; SEV1/SEV2 separate them so the
IC can coordinate without also debugging.

## 3. On-call doctrine

- **Per-domain rotations** — backend, frontend, AI/ML, infrastructure each carry
  their own on-call, aligned to ownership ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)).
- **Primary + secondary** — a secondary backstops a missed page.
- **Humane on-call** — paging load is tracked; a noisy rotation is a defect to
  fix ([sre-doctrine.md](sre-doctrine.md) §4), not a burden to absorb.
- **Every page is actionable**, and every alert links to a runbook.

## 4. Incident lifecycle

```
 detect ──▶ declare ──▶ assemble ──▶ mitigate ──▶ resolve ──▶ review
   │           │           │            │            │          │
 alert /    set SEV,    IC pulls in   stop the    confirm     blameless
 report     open       roles +       user harm   SLOs        post-incident
            channel    war room      (degrade,   recovered   review
                                     failover,
                                     roll back)
```

- **Detect** — an SLO-burn alert ([sre-doctrine.md](sre-doctrine.md)), a chaos
  experiment finding, or a human report.
- **Declare** — open a dedicated incident channel, assign SEV, name the IC.
- **Mitigate** — apply the fastest safe mitigation (§5) before chasing root
  cause.
- **Resolve** — declared only when SLOs are confirmed recovered, not when the
  fix is deployed.
- **Review** — blameless post-incident review for every SEV1/SEV2 (§7).

## 5. Mitigation & rollback doctrine

Preferred mitigations, fastest and safest first:

1. **Engage degradation / fallback** — let [graceful-degradation.md](graceful-degradation.md)
   absorb it (often automatic already).
2. **Roll back the change.** NEXT is GitOps ([ADR 0004](../adr/0004-gitops-argocd.md))
   — a bad deploy is reverted by reverting the manifest; ArgoCD reconciles.
   Rollback is the default response to an incident that correlates with a
   deploy. **Roll back first, root-cause after.**
3. **Fail over** — promote a standby, drain a region
   ([disaster-recovery.md](disaster-recovery.md)).
4. **Shed load** — pause T3/T2 to protect T0/T1 ([graceful-degradation.md](graceful-degradation.md) §3).
5. **Forward fix** — only when rollback is impossible (e.g. a one-way data
   migration); forward fixes are higher-risk and IC-approved.

Database migrations are written reversible ([ADR 0017](../adr/0017-database-per-service.md)
practice) precisely so rollback stays available.

## 6. Communication protocols

- **Internal** — the incident channel is the single source of truth; the scribe
  keeps the timeline; the comms lead posts periodic updates on a fixed cadence
  (more frequent for SEV1).
- **External** — a public **status page** reflects user-facing impact for
  SEV1/SEV2, in plain language, updated on a cadence. Honesty over optics.
- **Creator continuity** — for incidents affecting creators (upload, monetization,
  live), creators are communicated with directly; their work and earnings
  continuity is explicitly tracked during the incident.
- Updates state **impact, current action, and next update time** — never raw
  speculation.

## 7. Post-incident review

Every SEV1/SEV2 gets a **blameless post-incident review** within a few days:

- a factual timeline (from the scribe's log);
- user impact, quantified;
- what went well and what was hard;
- contributing factors — systemic, not personal;
- **action items** with owners and due dates, tracked to completion in the
  technical-debt register where appropriate.

The review's success metric is whether the _class_ of incident becomes less
likely or less severe — not whether someone was identified.

## 8. Security & abuse incidents

Resilience and security intersect; some incidents are adversarial.

| Incident                                          | Response                                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DDoS / volumetric attack**                      | edge absorption (CloudFront + Shield + WAF); rate limiting; the platform is built to serve cacheable load at the edge, which blunts most volumetric attacks                       |
| **Abuse / spam surge**                            | adaptive friction from risk-intelligence ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)) sheds abusive load while legitimate users keep capacity |
| **Credential-stuffing / login attack**            | auth-side rate limiting, anomaly detection, step-up challenges; account-takeover signals ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md))         |
| **AI cost / scraping attack**                     | trust-aware throttling + cost circuit breakers ([ai-resilience.md](ai-resilience.md) §7)                                                                                          |
| **Creator account protection during an incident** | elevated protection on creator accounts (monetization, identity) during platform incidents; suspicious changes held for review                                                    |

Adversarial incidents follow the same lifecycle (§4) with security domain
experts and, where needed, the security council in the loop.

## Related documents

- [sre-doctrine.md](sre-doctrine.md) · [disaster-recovery.md](disaster-recovery.md) · [chaos-engineering.md](chaos-engineering.md) · [graceful-degradation.md](graceful-degradation.md)
