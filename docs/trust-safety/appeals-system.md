# NEXT Appeals & Transparency

> Enforcement without recourse is not safety — it is just power. Every
> consequence NEXT applies is explainable, appealable, and audited.

## 0. Doctrine

Three principles, drawn straight from the constitution and the moderation
doctrine:

1. **Explainability** — a user always knows _what_ happened and _why_. No
   unexplained enforcement.
2. **Recourse** — every action has a meaningful appeal path reviewed by a human.
3. **Auditability** — every action and every appeal is immutably logged. The
   system can always answer "what did we do, to whom, and on what basis".

There is **no shadow enforcement** at NEXT. A visibility reduction is disclosed
to the affected creator exactly like a removal is. A consequence the user cannot
see is a consequence the user cannot appeal — and that is forbidden.

## 1. The enforcement explanation

Every enforcement action ([platform-governance.md](platform-governance.md))
generates an **enforcement notice** delivered to the affected user:

```
EnforcementNotice {
  action_id
  subject_id              // who is affected
  content_ref             // what content, if content-scoped
  action                  // warning · friction · visibility_reduction · restriction · suspension
  policy_ref              // the specific policy + version violated
  severity                // S0–S3
  rationale               // human-readable explanation, not a code
  evidence_summary        // what was observed (privacy-scrubbed)
  decided_by              // automated-high-confidence | human-review
  effective_at, expires_at
  appeal_url              // always present
}
```

The notice is mandatory. An action with no deliverable explanation cannot be
applied — the architecture treats "explanation" as part of the action, not an
optional follow-up.

## 2. The appeals pipeline

```
 enforcement notice ──▶ appeal filed ──▶ triage ──▶ human re-review ──▶ resolution ──▶ remedy
                              │                          │
                        appeal queue            (independent of original
                       (prioritized)             decision-maker)
```

- **Filing** — one click from the enforcement notice. The appeal opens a case
  in the appeals-service (proposed) and emits `moderation.appeal.created.v1`.
- **Triage** — appeals are prioritized by `severity × reach × time-since-action`
  and by whether the original action was automated (automated actions are
  appeal-prioritized — see §3).
- **Independent re-review** — the appeal is reviewed by a human who was **not**
  the original decision-maker. For automated original actions, the appeal is the
  _first_ human look.
- **Resolution** — `upheld`, `overturned`, or `modified` (e.g. suspension →
  warning). Emits `moderation.appeal.resolved.v1`.
- **Remedy** — an overturned action is reversed _and its trust impact is unwound_
  ([trust-architecture.md](trust-architecture.md)): the negative trust
  contribution from the reversed action is removed, not merely decayed.

## 3. Automated actions are provisional

A consequence applied by automation at high confidence is **provisional** until
the appeal window passes or an appeal resolves. This is the safeguard against
"irreversible automation":

- automated actions carry a standing right to expedited human review;
- a class of automated actions showing a high overturn rate is automatically
  **throttled** — the pipeline stops auto-applying that action class and routes
  it to humans until the model is recalibrated;
- nothing irreversible (permanent ban, data deletion) is ever fully automated.

## 4. Transparency reporting

Two layers of transparency:

- **To the individual** — the enforcement notice (§1) and the appeal outcome,
  plus a personal "account standing" view: current standing, active actions,
  and their expiry. A user can always see their own state.
- **To the public** — periodic, aggregate **transparency reports**: volumes of
  actions by category and severity, appeal rates, overturn rates, median
  escalation latency, and false-positive estimates. Aggregate only; no
  individual is identified.

Publishing overturn rates is deliberate: it makes the moderation system
accountable for its own error rate.

## 5. The audit log

Every moderation and enforcement action, every appeal, and every human decision
writes an **append-only audit record**. The audit log:

- is immutable (append-only; corrections are new records, never edits);
- captures actor, action, subject, policy ref, evidence ref, and timestamp;
- reuses the platform privileged-action audit stream
  (`audit.privileged.action.v1`) for staff actions;
- is the source of truth for transparency reports and for incident review.

Audit retention follows the compliance retention policy; audit records are
**never** subject to trust decay or deletion — decay applies to a user's _score_,
not to the _history_ of what the platform did.

## 6. No permanent invisible punishment

This is worth stating as its own section because it is the failure mode appeals
exist to prevent.

- **No shadowbanning.** A visibility reduction is a disclosed enforcement action
  with a notice, an expiry, and an appeal — never a silent ranking penalty.
- **No permanent record.** Enforcement decays ([trust-architecture.md](trust-architecture.md)
  §4); a years-old, low-severity action does not define a user forever.
- **Reinstatement path.** Even the highest-severity actions have a defined
  reinstatement workflow, except where law requires otherwise (e.g. child-safety
  removals). Reinstatement is a documented process, not an unwritten mercy.

## 7. Events

| Event                           | Producer                   | Consumers                               |
| ------------------------------- | -------------------------- | --------------------------------------- |
| `moderation.action.taken.v1`    | enforcement                | user notification, trust-service, audit |
| `moderation.appeal.created.v1`  | appeals-service (proposed) | moderation pipeline, observability      |
| `moderation.appeal.resolved.v1` | appeals-service (proposed) | enforcement, trust-service, audit       |
| `audit.privileged.action.v1`    | any staff-facing surface   | audit sink (compliance retention)       |

Streams: `moderation.events.v1`, `audit.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).
Appeal and enforcement events are **replayable** for audit reconstruction.

## 8. Observability

- appeal volume, appeal rate per action class;
- **overturn rate** per action class and per model — the headline false-positive
  signal; a rising overturn rate auto-throttles the action class (§3);
- escalation latency (notice → appeal resolution);
- transparency-report metric pipeline (aggregations into ClickHouse).

## Related documents

- [moderation-pipelines.md](moderation-pipelines.md) · [platform-governance.md](platform-governance.md) · [trust-architecture.md](trust-architecture.md)
