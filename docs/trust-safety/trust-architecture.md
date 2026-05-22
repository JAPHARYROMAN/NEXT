# NEXT Trust Architecture

> The integrity nervous system of NEXT. This document defines how trust is
> measured, how it moves, and the hard rules that keep a trust system from
> becoming a caste system.

## 0. Doctrine

Trust at NEXT exists to **protect humans and culture**, not to rank people. It
follows the constitution: protect creativity, experimentation, underground
communities, and authenticity — without permitting abuse, harassment, scams, or
coordinated harm.

Six invariants. Every trust mechanism is measured against them:

1. **Trust is earned and lost gradually.** No single event sets a score; no
   single event destroys one. Scores move on evidence over time.
2. **Trust decays toward neutral.** Enforcement history fades. There is no
   permanent invisible punishment and no permanent unearned privilege.
3. **New accounts start at neutral, not zero.** A new creator is _unproven_, not
   _distrusted_. Trust gates abuse, not newness.
4. **Trust is explainable.** Every score is decomposable into the signals that
   produced it. "Why is my trust low" is always answerable.
5. **Trust gates safety, not popularity.** Trust may suppress abuse and inform
   risk. It may **not** boost high-trust creators in ranking — see
   [recommendation-integration.md](recommendation-integration.md).
6. **Trust is appealable.** Any trust-driven consequence has a recourse path
   ([appeals-system.md](appeals-system.md)).

If a trust mechanism improves a safety metric but violates an invariant, it is
rejected. The invariants win.

## 1. Trust is event-driven (ADR 0024)

Per [ADR 0024](../adr/0024-trust-score-event-driven.md), trust scores are
**projections off event streams** — they are never computed on the write path
and never block a user action synchronously. `trust-service` consumes safety and
behavior events, recomputes scores asynchronously, and emits
`trust.score.updated` events. This means:

- A trust score is always _eventually_ consistent — acceptable, because trust
  gates slow consequences (visibility, friction), not individual requests.
- Trust is fully **rebuildable** by replaying the event log — no trust state is
  authoritative-only-in-place.
- Trust computation can be re-versioned (a new scoring model) by replaying.

## 2. The three trust subjects

Trust is scored for three kinds of subject. Each has its own signal set.

### 2.1 User trust

| Signal                 | Direction                                          |
| ---------------------- | -------------------------------------------------- |
| Account age            | older → higher (saturating, not unbounded)         |
| Behavioral consistency | stable patterns → higher; erratic/burst → lower    |
| Verification status    | verified contact/identity → higher                 |
| Community reputation   | positive standing in communities → higher          |
| Enforcement history    | recent enforcement → lower, **decaying over time** |

User trust gates _friction_ (rate limits, posting cooldowns) and _risk
weighting_ — it does not gate ordinary participation.

### 2.2 Creator trust

| Signal               | Direction                                                       |
| -------------------- | --------------------------------------------------------------- |
| Authenticity signals | verified, non-impersonating, disclosed synthetic media → higher |
| Engagement integrity | organic engagement → higher; bought/botted → sharply lower      |
| Audience trust       | audience itself is low-abuse → higher                           |
| Moderation history   | upheld violations → lower, decaying                             |
| Content originality  | original work → higher; mass-cloned/stolen → lower              |

Creator trust feeds **eligibility** decisions (monetization, live access) and
**safety review priority** — never a recommendation ranking boost (invariant 5).

### 2.3 Community trust

| Signal                        | Direction                                     |
| ----------------------------- | --------------------------------------------- |
| Moderation quality            | active, fair moderation → higher              |
| Abuse prevalence              | low abuse rate → higher                       |
| Trust health                  | members are themselves not low-trust → higher |
| Coordinated-manipulation risk | detected rings/raids → lower                  |

Community trust informs how much **autonomy** a community is granted (its own
moderation latitude) and how closely platform moderation watches it.

## 3. Score shape

A trust score is a value in `[0, 1]` with `0.5` = **neutral** (the new-account
baseline, invariant 3). It is **not** a single opaate number:

```
TrustScore {
  subject_id, subject_type        // user | creator | community
  value            float [0,1]    // 0.5 = neutral baseline
  components       map<signal, contribution>   // explainability (invariant 4)
  model_version    string
  computed_at      timestamp
  decay_floor      float           // how far enforcement can pull it down
}
```

The `components` map is mandatory — a score with no decomposition is not a valid
score. It is what makes "why" answerable to the user, to appeals, and to audit.

## 4. Decay

Decay is the mechanism behind invariants 1 and 2.

- **Enforcement decay** — a violation's negative contribution shrinks on a
  half-life (default 90 days for low severity, longer for high). Old mistakes
  stop defining a user.
- **Positive decay** — earned trust also decays slowly toward neutral if the
  subject goes inactive, so trust reflects _recent_ standing, not a historical
  high-water mark.
- **Decay floor** — severe, upheld violations (e.g. coordinated harm) set a
  `decay_floor` below which decay alone cannot lift the score; only an appeal or
  a defined reinstatement path can. This is the one bounded exception to "decay
  toward neutral" and it is always explainable.

## 5. The trust graph

Trust is also a **graph**, not only per-subject scores. Nodes are users,
creators, and communities; edges are interaction and affiliation. The graph
powers:

- **Coordinated-abuse detection** — dense subgraphs of mutual amplification, lock-step
  behavior, or shared infrastructure ([risk-intelligence.md](risk-intelligence.md)).
- **Trust propagation** — a brand-new account that is _vouched for_ by
  established, high-trust accounts may earn a small head-start above neutral;
  propagation is **bounded and capped** so it cannot mint trust at scale.
- **Contagion limiting** — a community saturated with low-trust members raises
  scrutiny without auto-punishing every member.

The trust graph shares the Neo4j cluster from [ADR 0023](../adr/0023-identity-graph-neo4j.md).

## 6. Trust events

Trust integrates with the platform via the event bus, using category streams
([ADR 0036](../adr/0036-event-topology.md)) and proto-defined payloads
([ADR 0039](../adr/0039-event-schema-source-of-truth.md)).

| Event                                 | Producer                        | Key consumers                              |
| ------------------------------------- | ------------------------------- | ------------------------------------------ |
| `trust.score.updated.v1`              | trust-service                   | recommendation, moderation, access-control |
| `trust.signal.observed.v1`            | many services                   | trust-service                              |
| `trust.creator.verified.v1`           | creator-verification (proposed) | trust-service, recommendation              |
| `trust.coordinated_abuse.detected.v1` | risk-intelligence (proposed)    | trust-service, moderation                  |

Stream: `trust.events.v1`. DLQ: `trust.events.dlq.v1`.

## 7. What trust must never become

- **A popularity proxy** — trust must not correlate with follower count or
  watch time. A small creator and a large creator with identical behavior have
  identical trust. (Enforced in [recommendation-integration.md](recommendation-integration.md).)
- **A permanent record** — see decay (§4).
- **A hidden score** — a user can see their own trust standing and its main
  components. Trust is not a secret dossier.
- **A blocker on the write path** — see ADR 0024 (§1).

## 8. Service ownership

`trust-service` (exists, deep — Phase 6) owns trust score computation and the
`trust.score.updated` projection. The trust graph, coordinated-abuse detection,
and creator verification are **proposed services**
([platform-governance.md](platform-governance.md) §service map) — designed here,
not implemented in this phase.

## Related documents

- [moderation-pipelines.md](moderation-pipelines.md) · [risk-intelligence.md](risk-intelligence.md) · [recommendation-integration.md](recommendation-integration.md) · [appeals-system.md](appeals-system.md)
- [ADR 0024 — Trust score is event-driven](../adr/0024-trust-score-event-driven.md)
