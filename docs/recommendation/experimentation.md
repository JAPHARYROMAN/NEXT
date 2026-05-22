# Recommendation Experimentation

Every ranking, diversity, pacing, and discovery-mode change ships behind an
experiment. No exceptions — the recommendation surface is too sensitive to ship
on intuition.

## Framework

Experiments run on the platform feature-flag + experimentation stack
([ADR 0013](../adr/0013-feature-flags.md), OpenFeature + GrowthBook). The
recommendation layer adds a domain-specific assignment + attribution model.

### Assignment

- Unit of assignment: **user** (sticky across sessions and devices).
- Assignment is computed in `feed-service` and written to the
  `experiment_assignments` table — every served slate records which experiment
  arms produced it.
- Holdout: a permanent ~1% global holdout receives a frozen baseline ranker, for
  long-horizon measurement of cumulative effects.

### Isolation

- Experiments declare which pipeline stage they touch (candidate gen / stage 1–4
  / pacing / mode inference).
- Two experiments touching the same stage are mutually exclusive unless
  explicitly declared orthogonal. The framework refuses overlapping assignment.

### Attribution

- Every `rec.recommendation.served.v1` carries the arm vector.
- Downstream `clicked` / `skipped` / playback-completion events join back to the
  arm vector in ClickHouse. Attribution is exact, not modeled.

## Metrics

### Primary metric — resonance

Not watch time. **Resonance** is a 30-day blended score per user:

```
resonance = w1 · satisfaction_proxy      (completion-weighted, dwell-normalized)
          + w2 · curiosity_expansion     (distinct topics/creators newly engaged)
          + w3 · creator_diversity       (entropy of creators engaged)
          − w4 · regret_signal           (rage-quit, fast-skip-after-click, hide)
```

A change must move resonance, or it does not ship — even if it moves short-term
engagement.

### Guardrail metrics (auto-abort)

A rollout halts automatically if any guardrail breaches its threshold:

| Guardrail              | Threshold             |
| ---------------------- | --------------------- |
| Exploration share      | ≥ 15% of served items |
| Creator Gini           | ≤ baseline + 0.03     |
| Emerging-creator share | ≥ baseline − 10%      |
| Topic entropy          | ≥ baseline − 5%       |
| End-to-end latency P75 | ≤ 130 ms              |
| Regret signal rate     | ≤ baseline + 5%       |

Guardrails encode the architecture.md §0 invariants. They are checked
continuously during a rollout, not just at the end.

## Rollout safety

1. **Offline replay** — the change is run against logged slates; resonance and
   guardrails are estimated before any live traffic. See replay simulation below.
2. **Shadow** — the new pipeline runs in shadow (scored, not served) for 24 h;
   distributions compared to production.
3. **Canary** — 1% → 5% → 25% → 50% → 100%, each step gated on guardrails
   holding for a fixed dwell time.
4. **Auto-abort** — any guardrail breach at any step rolls back to the previous
   step's allocation and pages the owning team.

## Replay simulation

`recommendation-service` and `ranking-service` are built so a logged request
(user context + candidate set + scores) can be re-run deterministically. This
powers:

- **regression tests** — a fixed corpus of logged slates; a ranking change must
  not regress resonance or guardrails on the corpus.
- **counterfactual replay** — estimate how a candidate change _would have_
  scored on historical traffic.
- **chaos replay** — synthetic adversarial sessions (pure-skip users, single-
  creator bingers, rapid taste-shift users) verify the invariants hold under
  stress.

## Experiment types

| Type           | Stage touched  | Typical guardrail focus     |
| -------------- | -------------- | --------------------------- |
| Ranking        | stage 1–2      | resonance, latency          |
| Diversity      | stage 3        | creator Gini, topic entropy |
| Pacing         | stage 4        | regret signal, fatigue      |
| Discovery-mode | mode inference | exploration share           |
| Candidate      | stage 0        | long-tail reach, latency    |

## What we do not test our way into

Experimentation tunes _how_ NEXT recommends, never _whether_ the invariants
hold. There is no experiment arm that removes the exploration floor, the creator
cap, or interest-graph decay. The invariants are not hypotheses.
