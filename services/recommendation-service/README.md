# recommendation-service

Candidate generation + ranking. Backed by the AI [`recommendation-engine`](../../ai/recommendation-engine) (training); the serving path lives here.

Owner: `@next-ecosystem/discovery`. Components:
- **`cmd/server` (Go)** — candidate gen via Qdrant + Redis feature store; orchestrates retrieval, calls the ranker.
- **`ranker/` (Rust)** — cross-encoder serving with batched GPU inference; ~10 ms P95.

## Public API (GraphQL subgraph)
- `recommendations(input)` — surface-targeted recommendations (home, watch-next, explore).

## Internal gRPC
- `CandidateService.Generate(user_id, surface, k) → Candidate[]`
- `RankerService.Rank(user_id, candidates, context) → ScoredCandidate[]`

## Events
**Emitted**: `rec.candidate.requested.v1`, `rec.ranking.completed.v1`.
**Consumed**: `feed.impression.v1`, `feed.interaction.v1`, `media.video.published.v1`, `profile.follow.created.v1`.

Partition key: `user_id`.

## Data
- Vector recall: Qdrant (`videos`, `creators`, `posts` collections).
- Feature store: Redis (per-user features TTL'd to 1 h; per-content features pre-warmed).
- Model artifacts: MLflow registry (pulled by Triton + the Rust ranker).

## Strategy
1. **Recall** — N candidates from Qdrant (k=500) + recency biased candidate sources.
2. **Filter** — muted creators, region restrictions, watch history dedup.
3. **Rank** — cross-encoder (Rust + ONNX Runtime + CUDA).
4. **Diversify** — MMR / determinantal point process for category spread.

## SLO
- `Candidate gen P95 < 50 ms` · `Rank P95 < 80 ms` · `End-to-end P75 < 130 ms`.

## Humane defaults
Per [SECTION 8](../../AGENTS.md): rankers optimize for **resonance** (long-term satisfaction proxies), not compulsion. Engagement signals weighted alongside repeated-view diversity and creator surface area.

[Runbook](../../docs/runbooks/recommendation-service.md).
