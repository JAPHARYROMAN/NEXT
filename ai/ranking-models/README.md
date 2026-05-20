# ranking-models

The models behind ranking stages 1–2: the lightweight scorer and the semantic
cross-encoder served by `ranking-service`.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns

- Training the gradient-boosted lightweight scorer on shallow features.
- Training the cross-encoder that jointly encodes (context, candidate) and emits
  separate **relevance** and **novelty** scores (ADR 0030).
- Eval harnesses: NDCG@k, MAP, AUC offline; resonance-based online evaluation.

## What this system does NOT own

- Online serving — that is `ranking-service` (Go orchestrator + Rust ONNX ranker).

## Training pipeline

1. Daily Ray Data job materializes interaction windows from ClickHouse.
2. Ray Train trains the scorer + cross-encoder; MLflow logs the run.
3. Shadow traffic for 24 h; promote on a resonance win, not a watch-time win.

## SLO

- Offline NDCG@10 must not regress on the fixed replay corpus before promotion.

See [MODEL_CARD.md](MODEL_CARD.md) and [docs/recommendation/ranking-system.md](../../docs/recommendation/ranking-system.md).
