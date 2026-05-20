# NEXT Moderation Pipelines

> How content is evaluated for harm — a layered pipeline that is fast where it
> can be cheap, careful where it must be, and human where it matters.

## 0. Doctrine

Moderation at NEXT prioritizes **nuance, proportionality, transparency,
explainability, and context** over blunt suppression. The pipeline is designed
so that:

- the cheap, fast layers **never make irreversible decisions** alone;
- ambiguity escalates to humans rather than defaulting to removal;
- every action is **explainable** and **appealable**;
- false positives are a tracked, first-class error — over-blocking is a failure,
  not a safe default.

Moderation is not censorship tooling. Its job is to remove abuse, scams, and
coordinated harm while leaving creative, experimental, and pseudonymous
expression intact.

## 1. The five-layer pipeline

Content flows through five layers. Each is more expensive and more authoritative
than the last; cheap layers **filter and route**, they do not finalize.

```
 content / signal
       │
  L1  realtime automated detection ......  ms      classify · route · hold-if-critical
       │
  L2  AI semantic analysis ..............  sub-sec  multimodal models · context
       │
  L3  risk scoring ......................  sub-sec  fuse signals + trust + reach → risk
       │
  L4  human review escalation ...........  minutes  prioritized queues · decisions
       │
  L5  appeals + audit ...................  async    recourse · transparency · learning
```

### Layer 1 — Realtime automated detection

Cheap, fast classifiers and deterministic checks: known-bad media hashes, link
reputation, rate/burst signals, obvious-pattern detectors. Runs inline on
publish and on every comment/message. **L1 may only**: pass, attach a signal, or
place a **temporary hold** on S0-critical matches (e.g. a CSAM hash hit) pending
higher layers. L1 never issues an enforcement action by itself.

### Layer 2 — AI semantic analysis

Multimodal models evaluate meaning in context (see §2). L2 produces _calibrated
probabilities with context_, not verdicts — e.g. "0.82 harassment, but the
target is the speaker themselves" or "violent imagery in an apparent news
context". L2 output always carries an uncertainty band.

### Layer 3 — Risk scoring

Fuses L1 + L2 signals with **trust context** ([trust-architecture.md](trust-architecture.md))
and **reach** (how many people the content will hit) into a single `risk_score`
and a `severity` (§3). Risk scoring is where proportionality is computed: the
same content from a low-trust account with a botted audience and from an
established creator gets different _handling_, not different _truth_.

### Layer 4 — Human review escalation

Anything above an auto-action confidence band, or anything S0/S1, lands in a
**prioritized human queue** (priority = `severity × reach × risk`). Human
reviewers make the authoritative decision. The platform never fully automates an
irreversible action on ambiguous content.

### Layer 5 — Appeals + audit

Every action is logged immutably; the user is told what happened and why; and
the appeal path is open ([appeals-system.md](appeals-system.md)). Appeal
outcomes feed back as training/calibration signal — L5 is also how the pipeline
_learns_ from its mistakes.

## 2. Multimodal moderation

Moderation must understand text, image, audio, and video — and NEXT is a video
platform, so video is first-class.

| Modality   | Detects                                                      | Notes                                                        |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Text**   | toxicity, threats, scams, harassment, spam                   | titles, descriptions, comments, creator metadata; future DMs |
| **Vision** | violence, explicit content, impersonation, manipulated media | thumbnails + sampled video frames                            |
| **Audio**  | hate speech, threats, abuse                                  | transcript-derived (ASR) + prosody                           |
| **Video**  | contextual harm, livestream risk, coordinated abuse          | scene + temporal context, not single frames                  |

AI moderation models are **Python subsystems** under `/ai` (per
[ADR 0016](../adr/0016-ai-serving.md)); the moderation pipeline service consumes
them as inference contracts. Design rules for the models:

- **Preserve nuance** — a model emits a probability + context, never a binary
  ban verdict.
- **Support human override** — every model output is overridable; humans are
  authoritative.
- **Avoid over-blocking** — false-positive rate is a tracked guardrail metric;
  a model update that raises it is rejected, mirroring the recommendation
  guardrail discipline.
- Context matters: reclaimed slurs, news/documentary violence, satire, and
  artistic nudity are exactly the cases L2 must get right and L4 exists to catch.

## 3. Severity taxonomy

Every flagged item is classified into a severity tier. Severity drives handling
speed and the enforcement ceiling — not the verdict.

| Tier   | Meaning                 | Examples                                                        | Handling                                                  |
| ------ | ----------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| **S0** | Critical, imminent harm | CSAM, credible violence threat, active coordinated harm         | immediate hold + human review; child-safety path (see §5) |
| **S1** | High harm               | targeted harassment, scams/fraud, doxxing, non-consensual media | fast-track human review                                   |
| **S2** | Moderate                | spam, misleading content, repeated low-grade abuse              | risk-scored; auto-action only at high confidence          |
| **S3** | Low / borderline        | context-dependent edge cases, mild policy friction              | nudge/label; rarely removed; human review if contested    |

Severity is assigned at L3 and confirmed or revised at L4.

## 4. What gets moderated

Text, video, audio, live streams, thumbnails, comments, creator metadata, and
(future) DMs. Each enters at L1 on creation/publish; live streams run a
continuously-sampled variant ([live-moderation.md](live-moderation.md)).

## 5. Child safety path

S0 child-safety content is handled on a **separate, zero-tolerance path** with
the highest priority, hash-matching against known-illegal-media databases,
immediate hold, specialized human review, and mandatory legal reporting. This
path is deliberately described only at the architectural level here; operational
detail lives in restricted runbooks, not in this document. Child safety is never
subject to the proportionality trade-offs of §1 — it is removed and reported.

## 6. Moderation events

| Event                           | Producer                           | Consumers                                         |
| ------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `moderation.content.flagged.v1` | L1/L2 detectors, user reports      | moderation pipeline                               |
| `moderation.review.started.v1`  | moderation pipeline                | observability, audit                              |
| `moderation.action.taken.v1`    | moderation pipeline / human review | enforcement, trust-service, recommendation, audit |
| `moderation.appeal.created.v1`  | appeals-service (proposed)         | moderation pipeline                               |
| `moderation.appeal.resolved.v1` | appeals-service (proposed)         | trust-service, enforcement, audit                 |

Stream: `moderation.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).
Moderation events are **replayable** — the pipeline can re-run historical
content against an updated model for backfill or audit.

## 7. Data

- **PostgreSQL** — moderation queues, review state, enforcement records
  (one DB per service, [ADR 0017](../adr/0017-database-per-service.md)).
- **ClickHouse** — moderation analytics, false-positive tracking, latency
  ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md)).
- **Vector store** — semantic retrieval of near-duplicate known-bad content, so
  a re-upload of removed material is caught without re-running full analysis.
- **Graph** — coordinated-abuse signals ([risk-intelligence.md](risk-intelligence.md)).

## Related documents

- [live-moderation.md](live-moderation.md) · [appeals-system.md](appeals-system.md) · [platform-governance.md](platform-governance.md) · [trust-architecture.md](trust-architecture.md)
