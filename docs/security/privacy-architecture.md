# Privacy Architecture

> Privacy is a security goal, not its casualty. NEXT personalizes and discovers
> without building a surveillance dossier — this document is how.

## 0. Principle

Most platforms treat privacy and personalization as a trade: to recommend well,
surveil deeply. NEXT rejects the trade. Its recommendation engine already runs
on **derived, decaying signals** — not a permanent behavioral file
([docs/recommendation/architecture.md](../recommendation/architecture.md),
[ADR 0032](../adr/0032-interest-graph-decay.md)) — and its trust scores are
**decomposable and user-visible**, not a secret dossier
([docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md)).
Privacy architecture extends that stance across the platform.

> This is system architecture, not legal advice. It is designed to _support_
> compliance ([compliance](#9-compliance-support)); the legal rules come from
> qualified counsel.

## 1. Data minimization

- Collect **only what a feature genuinely needs** — the default is not to
  collect. A new data point requires a stated purpose.
- Prefer **derived signals over raw records** — the interest graph stores
  affinities, not a log of every video watched forever.
- Prefer **aggregate over individual** — analytics that can be answered in
  aggregate are not stored per-person (e.g. emotion analysis is aggregate,
  never a per-person affect profile, [docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md)).
- Data has a **purpose and a lifetime**; data with neither is not collected.

## 2. Telemetry privacy

- Observability and analytics telemetry carries **no PII, no secrets, no raw
  sensitive content** ([security-observability.md](security-observability.md),
  [docs/standards/observability-standards.md](../standards/observability-standards.md)).
- Telemetry identifies _sessions and events_, not _people_, wherever the signal
  allows it; identifiers are pseudonymous where possible.
- Redaction happens **structurally at the logging/telemetry boundary** — not by
  remembering to omit a field.

## 3. Consent architecture

- Data uses beyond what a feature strictly requires are **consent-gated** — the
  user makes an informed, revocable choice.
- Consent is **granular** (per purpose), **revocable** (withdrawing is as easy
  as granting — the anti-dark-pattern rule, [docs/economy/creator-monetization.md](../economy/creator-monetization.md)),
  and **recorded** (an auditable consent state).
- The default for a non-essential use is **off** — opt-in, not opt-out.

## 4. Creator privacy controls

- **Pseudonymity is protected** — a creator is never required to expose a legal
  identity to use, verify on, or earn from NEXT
  ([docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md)).
- A creator controls the visibility of their profile data, their audience
  relationship data, and their analytics.
- Sensitive creator data — identity documents, payout/tax data — is encrypted,
  least-privilege, and redacted in logs
  ([docs/economy/payouts.md](../economy/payouts.md)).

## 5. Retention policies

- Every data category has an **explicit retention period** tied to its purpose.
- When the purpose ends or the period elapses, data is deleted or irreversibly
  anonymized.
- **Exception** — financial and audit records are retained for the compliance
  period and are never decay-deleted ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md) §5,
  [docs/economy/tax-compliance-architecture.md](../economy/tax-compliance-architecture.md));
  retention there is a _requirement_, and these records are minimized and
  access-controlled rather than deleted.

## 6. Deletion workflows — and the event-sourcing tension

NEXT is event-sourced; the event log is immutable and replayable
([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).
That collides with "delete my data". The architecture resolves it deliberately:

- **Crypto-shredding** — personal data referenced by events is stored encrypted
  with a per-subject key; deletion **destroys the key**. The event log stays
  intact and replayable, but the personal data it referenced becomes
  unrecoverable. This is the primary mechanism.
- **Tombstone events** — a deletion is itself an event; consumers and
  projections process it and purge derived personal data.
- **Derived stores re-derive** — caches, embeddings, and projections rebuilt
  after a deletion no longer contain the deleted data.
- A deletion request has a defined, tracked workflow and a completion signal —
  the user is told when it is done.

The result: a user can have their personal data erased _without_ the platform
losing the structural integrity of its event log.

## 7. Regional privacy handling

- **Data residency** — where a region requires it, personal data is stored and
  processed in-region ([docs/roadmap/global-expansion.md](../roadmap/global-expansion.md),
  [docs/resilience/global-topology.md](../resilience/global-topology.md)).
- Regional privacy rules are handled by a **policy layer**, not hard-coded —
  the same versioned-rules-engine approach as tax
  ([docs/economy/tax-compliance-architecture.md](../economy/tax-compliance-architecture.md)).
- Cross-border data flows follow the applicable region's rules.

## 8. Personalization without surveillance

The payoff — NEXT keeps discovery quality _and_ privacy because:

- the recommendation signal is **derived and decaying**, not a permanent log
  ([ADR 0032](../adr/0032-interest-graph-decay.md));
- a user can **see and steer** their interest model — it is not a hidden file
  ([docs/roadmap/discovery-evolution.md](../roadmap/discovery-evolution.md));
- the business model is **creator-to-audience value**, not surveillance
  advertising ([docs/roadmap/anti-patterns.md](../roadmap/anti-patterns.md) AP-8) —
  so there is no commercial incentive to over-collect.

Privacy and personalization are aligned here, not opposed.

## 9. Compliance support

The architecture is built to _support_ compliance regimes (GDPR-class rights,
creator financial compliance, regional residency): data minimization (§1),
granular consent (§3), explicit retention (§5), deletion workflows (§6),
residency (§7), access transparency and audit trails
([security-observability.md](security-observability.md)). NEXT designs the
_system capabilities_; legal interpretation is supplied by counsel.

## 10. Prohibited patterns

- ✗ Collecting data with no stated purpose or no retention period.
- ✗ PII, secrets, or raw sensitive content in telemetry or logs.
- ✗ Opt-out (rather than opt-in) for a non-essential data use.
- ✗ A consent that is hard to withdraw.
- ✗ Requiring a legal identity to use or earn on the platform.
- ✗ Treating "we are event-sourced" as a reason a user cannot be deleted.
- ✗ A surveillance dossier built in the name of personalization or security.

## Related

- [docs/recommendation/fairness-systems.md](../recommendation/fairness-systems.md) · [docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md) · [security-observability.md](security-observability.md) · [ADR 0032](../adr/0032-interest-graph-decay.md)
