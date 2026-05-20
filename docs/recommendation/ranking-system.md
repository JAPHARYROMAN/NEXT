# Ranking System

Ranking is a four-stage funnel. Each stage is cheaper-per-item than it looks
because the stage before it has already shrunk the candidate set. The ordering
is deliberate: **diversity and fairness run before the final rerank**, so they
shape the slate rather than cosmetically reorder it.

## Stage 0 — candidate generation

Union of recall sources (see architecture.md §4), deduplicated by content id,
with hard filters applied early: muted creators, blocked content, region
restrictions, already-watched (unless rewatch-eligible), safety holds.

Output: 1–5k candidates, each tagged with its source(s).

## Stage 1 — lightweight ranking

A cheap scorer (gradient-boosted trees / logistic regression) over shallow
features: content age, creator affinity, source priors, coarse embedding
similarity, popularity prior. No cross-encoder, no GPU.

Purpose: throw away the obvious non-matches fast. 5k → ~500.

## Stage 2 — semantic ranking

The cross-encoder (Rust + ONNX + CUDA, in `ranking-service`). It jointly encodes
`(user/session context, candidate)` and scores two things:

- **relevance** — does this resonate with who the user is and what they're doing?
- **novelty** — how far is this from what the user has already seen?

Output is `score = relevance` and a separate `novelty ∈ [0,1]`. They are kept
separate on purpose — stage 4 needs to weight them differently per mode. 500 → ~200.

## Stage 3 — diversity balancing

This is the stage that protects the feed. It takes ~200 ranked candidates and
selects ~80 with **Maximal Marginal Relevance**, generalized to multiple
diversity axes:

```
select next = argmax [ λ · relevance(c)
                       − (1−λ) · max_similarity(c, already_selected) ]
```

where `similarity` is a weighted blend over six axes:

| Axis      | Distance metric                                    |
| --------- | -------------------------------------------------- |
| Creator   | same-creator penalty (hard cap: ≤ 25% per creator) |
| Topic     | interest-cluster overlap                           |
| Aesthetic | content-embedding cosine                           |
| Pacing    | intensity / energy delta                           |
| Format    | short / long / live / clip                         |
| Exposure  | already-popular vs. long-tail                      |

Creator-fairness scoring is folded in here: a small/emerging creator gets a
relevance bonus that exactly offsets the popularity prior they lack, so they
compete on resonance, not on incumbency. See [fairness-systems.md](fairness-systems.md).

`λ` is mode-dependent: high in Precision (favor relevance), low in Chaos (favor
spread). 200 → ~80.

## Stage 4 — final rerank

The slate is now relevant and diverse. Stage 4 orders it for the _experience_:

1. **Mode weighting** — blend `relevance` and `novelty` by the discovery-mode
   appetite scalar (discovery-modes.md).
2. **Emotional pacing** — reorder so intensity rises and falls rather than
   flatlining; insert "breath" content after high-intensity runs (see
   fairness-systems.md §pacing).
3. **Exploration injection** — guarantee the ≥ 15% exploration floor; if the
   slate is short on it, swap in long-tail / serendipity candidates and emit
   `rec.exploration.injected.v1`.
4. **Freshness** — light recency tie-break.

Output: the final slate of N items.

## Scoring contract

Every served item carries its score breakdown for observability and replay:

```
ScoredCandidate {
  content_id, creator_id
  relevance        float   # stage 2
  novelty          float   # stage 2
  diversity_margin float   # stage 3 — MMR margin at selection
  final_score      float   # stage 4
  sources          []string
  exploration      bool    # injected to satisfy the floor
}
```

This makes "why was I shown this" answerable, and makes offline replay exact.

## What ranking does NOT optimize

- Raw watch time. It is an input, never the objective.
- Click-through as a terminal goal. CTR without dwell/satisfaction is rage-bait.
- Session count / return frequency as a primary metric.

The objective is **resonance**: a 30-day blend of satisfaction proxies, creator
diversity, and curiosity expansion. See [experimentation.md](experimentation.md).

See [ADR 0030](../adr/0030-multi-stage-ranking.md).
