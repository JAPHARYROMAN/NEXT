# highlight-detection

Highlight + key-moment scoring. Ranks segments of a video by likely viewer interest and proposes clip ranges for `clip-generation-service` to cut into reels.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.published.v1`)

1. **Segment features** — pull scene cuts, emotion timeline, transcript salience.
2. **Engagement prior** — early retention curve from `media-analytics-service`.
3. **Score** — gradient-boosted ranker over fused features → per-segment interest score.
4. **Propose** — non-max suppression → top-K non-overlapping clip ranges.
5. **Persist** — emit `ai.highlight.detected.v1`; consumed by `clip-generation-service`.

## Doctrine

- Suggests, never auto-publishes without a creator opt-in.
- Re-scores as real retention data lands (cold-start prior → observed).

## SLO

- Publish → highlight proposals P95 < 5 min.
- Top-3 proposal precision > 0.6 vs. creator-accepted clips.

See [MODEL_CARD.md](MODEL_CARD.md).
