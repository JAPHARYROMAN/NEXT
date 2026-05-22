# Fairness, Diversity & Pacing Systems

The systems that keep NEXT's feed _alive_ — culturally diverse, fair to
creators, emotionally breathable. These are not post-hoc filters; they are
constraints wired into stage 3 and stage 4 of ranking.

## Creator fairness

The failure mode of every recommender: the rich get richer. Popular creators
accumulate engagement signal, which raises their ranking, which gets them more
engagement. Small and emerging creators are locked out structurally.

NEXT counters this with three mechanisms:

### 1. Popularity-offset bonus

In stage 3, a creator's relevance score is adjusted:

```
adjusted = relevance + offset(creator)
offset   = k · (1 − normalized_exposure(creator))
```

A creator with near-zero historical exposure gets the full `k` bonus; a
mega-creator gets ~0. The bonus is calibrated so an emerging creator competes on
_resonance_ — does this content land — not on incumbency.

### 2. Per-session creator cap

No creator may occupy more than **25%** of a single session slate. Hard cap,
enforced in stage-3 selection. Prevents one creator (or an "engagement cartel"
boosting each other) from owning a feed.

### 3. Long-tail recall guarantee

The long-tail and fresh-injection candidate sources (architecture.md §4) are
never budgeted to zero. There is always a path for quality content with low
exposure to reach a slate, independent of its current popularity.

**Fairness metrics** (tracked in ClickHouse, guardrails in every experiment):

- creator Gini coefficient over served impressions (lower = fairer)
- emerging-creator surface share (% of impressions to creators < 90 days old)
- long-tail reach (distinct creators served / distinct creators eligible)

## Diversity (anti-homogenization)

A feed dies when it becomes repetitive, trend-cloned, or emotionally flat.
Stage-3 MMR enforces spread across six axes (see ranking-system.md §stage 3):
creator, topic, aesthetic, pacing, format, exposure.

Additional anti-homogenization measures:

- **Aesthetic-cluster cap** — no single visual/style cluster > 40% of a slate.
- **Trend-clone suppression** — when many recent uploads are near-duplicates of a
  viral template, their mutual similarity penalty rises; the _origin_ of a trend
  is preserved, the 500th clone is suppressed.
- **Format rotation** — short / long / live / clip are interleaved, not batched.

**Diversity metrics**: intra-slate average pairwise distance per axis;
topic-entropy of served feeds; aesthetic-cluster concentration.

## Interest graph & anti-lock-in

Personalization is a decaying graph (architecture.md §7). The anti-lock-in
mechanics:

- **Edge decay** — affinity edges lose weight on a half-life (default 21 days).
  An interest the user stops engaging with fades; the graph reflects _now_.
- **No terminal nodes** — the graph always retains exploration edges to
  non-adjacent clusters. A user is never graph-isolated into one region.
- **Reinvention support** — a sustained shift in behavior re-weights the graph
  faster than decay alone (a learning-rate boost on detected taste change), so a
  user who changes is not fighting their own history for weeks.
- **Exploration vectors** — each user has a vector pointing _away_ from their
  centroid; the serendipity candidate source samples along it.

## Emotional pacing

Feeds should breathe. The pacing model (a sequence model in `feed-service`)
tracks per-session:

| Signal                | Meaning                                               |
| --------------------- | ----------------------------------------------------- |
| intensity run-length  | consecutive high-energy items                         |
| fatigue score         | rising with session length + intensity + skip rate    |
| overstimulation flag  | intensity variance collapsed (everything is loud)     |
| exploration readiness | inverse of fatigue — when the user can absorb novelty |

Stage 4 uses these to:

- insert lower-intensity "breath" content after high-intensity runs;
- vary emotional tone — avoid 20 consecutive items of the same affect;
- when fatigue is high, _shorten_ the implied feed and stop pushing intensity,
  rather than escalating to recapture attention.

The pacing model explicitly does **not** have a dopamine-maximizing objective.
Its objective is varied, sustainable sessions — the opposite of an intensity
ratchet.

## The guardrail principle

Exploration share, creator Gini, and topic entropy are **guardrail metrics** on
every experiment (experimentation.md). A ranking change that improves
engagement but degrades a guardrail past its threshold is auto-rejected. The
invariants in architecture.md §0 are enforced here, in code and in CI for
experiments — not left to good intentions.

See [ADR 0031](../adr/0031-anti-homogenization.md) and
[ADR 0032](../adr/0032-interest-graph-decay.md).
