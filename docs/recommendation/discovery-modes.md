# Discovery Modes

NEXT recommends in three modes. They are **not user-facing settings** and not
discrete states — they are a continuous position on an _exploration appetite_
axis that the system infers and moves along, per request.

```
   PRECISION ───────────── DISCOVERY ───────────── CHAOS
   exploit                 expand                   surprise
   confidence 0.0 ─────────────────────────────────── 1.0
```

## The three modes

### Precision mode

Highly relevant content the model is confident about. Tight to the interest
centroid. Used when the user shows focused intent — searching, deep in a topic,
short session, or returning to a clear preference.

- Candidate budget: collaborative + semantic + creator-affinity dominant.
- Ranking: relevance-weighted; novelty down-weighted.
- Risk: an all-precision feed is an echo chamber. Precision is **capped** — even
  at maximum exploit, ≥ 15% of the slate is exploration (invariant 1).

### Discovery mode

Adjacent interests and curiosity expansion. Content one step away from what the
user already likes — a neighboring genre, a related community, a creator in the
same aesthetic cluster but not yet seen.

- Candidate budget: community-affinity, trending, and semantic-at-distance grow.
- Ranking: novelty weight rises; relevance still matters.
- This is the **default resting mode** for a healthy, relaxed session.

### Chaos mode

Unexpected creative emergence. Content deliberately distant from the interest
centroid — underground culture, niche creators, formats the user has never
engaged with. Controlled chaos: still quality-filtered, never random.

- Candidate budget: long-tail, fresh injection, and serendipity dominate.
- Ranking: novelty and creator-diversity weighted heavily; relevance is a floor,
  not a target.
- Chaos is _bounded_ — quality gates and safety filters always apply. "Chaos"
  means surprising, not low-quality.

## Mode inference

The mode is a function of session signals, computed per request:

| Signal                             | Pushes toward Precision | Pushes toward Chaos |
| ---------------------------------- | ----------------------- | ------------------- |
| Session length                     | short                   | long                |
| Skip rate (recent)                 | low                     | high                |
| Repeated rewatches                 | high                    | low                 |
| Search-driven entry                | yes                     | no                  |
| Dwell-time variance                | low                     | high                |
| Time since last "novel" engagement | short                   | long                |
| Explicit "show me something else"  | —                       | strong              |
| Fatigue score (see pacing)         | low                     | high                |

A high skip rate is read as _"the model's confident guesses are wrong — widen
the aperture"_, so skips push toward Chaos, not toward more of the same. This is
the opposite of a watch-time optimizer, which would narrow on skips.

`exploration_appetite ∈ [0,1]` is the scalar output. It maps to candidate-source
budgets and to the novelty weight in stage-4 reranking.

## Mode transitions

Modes shift **gradually within a session** — no jarring jumps. The appetite
scalar is smoothed (EWMA) so a single skip does not whiplash the feed. A mode
change emits `rec.discovery.mode.changed.v1` for observability and for the
pacing model.

## Why three, continuously

Two modes (exploit/explore) is the classic bandit framing and it is too coarse:
it cannot express "expand gently" vs. "surprise me hard". Three named anchors on
a continuous axis give product, experimentation, and observability a shared
vocabulary while the runtime still interpolates smoothly.

See [ADR 0029](../adr/0029-three-discovery-modes.md).
