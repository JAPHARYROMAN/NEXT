# feed-intelligence

Session-sequence modeling + emotional pacing. The models that read a session as
it unfolds and keep the feed breathing.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- The session sequence model: per-event updates to the fast session vector.
- The emotional-pacing model: fatigue, overstimulation, intensity-run, and
  exploration-readiness signals consumed by `feed-service` (ADR 0031 pacing).
- Feed-health modeling: detecting repetitive / emotionally flat sessions.

## Training pipeline

1. Ray Data materializes ordered session event streams from ClickHouse.
2. Ray Train fits the sequence + pacing models; MLflow logs the run.
3. Chaos replay (pure-skip, single-creator-binge, rapid-shift sessions) verifies
   the pacing model degrades gracefully rather than escalating intensity.

## Doctrine

- The pacing objective is varied, sustainable sessions — explicitly **not** a
  dopamine-maximizing objective. High fatigue calms the feed; it never ratchets.

## SLO

- Session-vector update P95 < 5 ms (online, in `personalization-service`).

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/fairness-systems.md](../../docs/recommendation/fairness-systems.md).
