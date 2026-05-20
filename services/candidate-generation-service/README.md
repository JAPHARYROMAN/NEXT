# candidate-generation-service

The recall layer. Stage 0 of the funnel: it produces a wide, cheap union of
candidates from many sources, each with a mode-dependent budget, deduplicated
and pre-filtered.

Owner: `@next-ecosystem/discovery`.

## Internal gRPC

- `CandidateGenerationService.Generate(user_id, surface, appetite, k) → Candidate[]`

## Sources (each budgeted; never one source filling a slate)

- collaborative · semantic · creator-affinity · community-affinity
- trending · long-tail · fresh injection · serendipity

Budgets shift with the discovery-mode appetite scalar — Precision leans on
collaborative + semantic; Chaos leans on long-tail + fresh + serendipity. The
long-tail / fresh / serendipity budgets are **never zero** (ADR 0031).

## Events

**Emitted**: `rec.candidate.requested.v1`.
**Consumed**: `media.video.published.v1`, `profile.follow.*`, `community.post.created.v1`.

Partition key: `user_id`.

## Data

- Vector recall delegated to `semantic-retrieval-service` (Qdrant).
- Collaborative neighbors + trending tables in `candidate_gen` Postgres / Redis.
- Hard filters applied early: muted creators, region restrictions, watch-history dedup.

## SLO

- `Generate P95 < 50 ms` for k ≤ 5000.

[Runbook](../../docs/runbooks/candidate-generation-service.md) · [Architecture](../../docs/recommendation/architecture.md).
