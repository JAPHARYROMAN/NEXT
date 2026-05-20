# creator-affinity

Creator-affinity modeling + creator fairness. Models the bond between a user and
a creator — and the structural mechanisms that keep small creators reachable.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- The creator-affinity graph: per-user, per-creator affinity from follow,
  watch-depth, rewatch, and share signals.
- Creator embeddings: a creator's catalog aggregate + style signature.
- The fairness calibration: tuning the popularity-offset bonus `k` so emerging
  creators compete on resonance, not incumbency (ADR 0031).
- Fairness metrics: creator Gini, emerging-creator surface share, long-tail
  reach — the guardrail inputs for experimentation.

## Pipeline

1. Nightly Ray Data job rebuilds affinity edges + creator embeddings.
2. Fairness metrics are recomputed and published to ClickHouse.
3. Coarse engagement-cartel detection (mutually-boosting creator rings).

## Doctrine

- No creator monopoly, no algorithmic lockout. The long tail has a structural
  on-ramp, not a charity slot (ADR 0031).

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/fairness-systems.md](../../docs/recommendation/fairness-systems.md).
