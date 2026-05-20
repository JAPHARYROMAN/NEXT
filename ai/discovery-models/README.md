# discovery-models

The models behind discovery-mode inference and controlled serendipity — the
intelligence that decides _how far to reach_.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- The discovery-mode inference model: session signals → exploration-appetite
  scalar (ADR 0029).
- Serendipity sampling: choosing content distant from the interest centroid
  that is still quality-gated — surprising, never random.
- Exploration-policy tuning (bandit / RL) for the candidate-source budgets.

## Training pipeline

1. Ray Data materializes session sequences + downstream resonance from ClickHouse.
2. Ray Train fits the appetite model; MLflow logs the run.
3. Counterfactual replay estimates the exploration/resonance trade before rollout.

## Doctrine

- The objective is curiosity expansion and long-term resonance, never
  watch-time capture. A model that raises engagement by narrowing the feed is
  rejected.

## SLO

- Exploration share of served slates must stay ≥ 15% in every candidate model.

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/discovery-modes.md](../../docs/recommendation/discovery-modes.md).
