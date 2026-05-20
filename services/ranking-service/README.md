# ranking-service

The scoring engine. Hosts ranking stages 1–2 of the four-stage funnel: the
lightweight scorer and the semantic cross-encoder. `recommendation-service`
orchestrates the funnel; this service does the heavy scoring.

Owner: `@next-ecosystem/discovery`. Components:

- **`cmd/server` (Go)** — stage-1 lightweight scorer; batches + dispatches to the cross-encoder.
- **`ranker/` (Rust)** — the cross-encoder, ONNX + CUDA, batched GPU inference.

## Internal gRPC

- `RankingService.Rank(context, candidates) → ScoredCandidate[]` — runs stages 1–2.
- `RankingService.ScoreBatch(pairs) → score[]` — raw cross-encoder access for replay.

## Events

**Emitted**: `rec.ranking.completed.v1`.
**Consumed**: model-promotion notifications from MLflow.

Partition key: `user_id`.

## Data

- Model artifacts pulled from the MLflow registry; cross-encoder served from ONNX.
- Feature store reads from Redis (per-user features, 1h TTL).

## Contract

- `Rank` emits `relevance` and `novelty` as **separate** scores — the final
  rerank weights them per discovery mode (ADR 0030).
- Every scored item carries its feature vector for offline replay.

## SLO

- `Rank P95 < 80 ms` · cross-encoder `ScoreBatch P95 < 10 ms` per batch.

[Runbook](../../docs/runbooks/ranking-service.md) · [Ranking system](../../docs/recommendation/ranking-system.md).
