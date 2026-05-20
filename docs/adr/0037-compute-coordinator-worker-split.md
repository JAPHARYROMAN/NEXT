# 0037. Compute services use a Go coordinator + relocated perf worker

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture · Backend
- **Tags**: media, recommendation, services, governance

## Context

The Phase 10 audit found two compute capabilities each implemented twice
([runtime-boundary-audit.md](../audits/runtime-boundary-audit.md) RB-2/RB-3,
[multi-agent-drift-report.md](../audits/multi-agent-drift-report.md) DR-2/DR-7,
debt TD-02/TD-10):

- **Transcoding** — `transcoding-service` (Go) owns a job state machine and a
  gRPC contract (`SubmitJob`/`ClaimNext`/`CompleteRung`). Separately,
  `services/media-service/transcoder/` is a Rust ffmpeg worker on a _different_
  contract (Kafka `media.transcode.requested.v1`), nested inside another
  service's directory.
- **Ranking** — `recommendation-service/ranker/` is a Rust cross-encoder.
  `ranking-service` is an empty Go scaffold whose README claims to host it.

Both are the same shape: a Go service that should coordinate, and a Rust
perf-critical worker that is either misplaced or duplicated.

## Decision

A **compute service** — one whose core work is CPU/GPU-bound (transcoding,
cross-encoder ranking) — is structured as:

1. a **Go coordinator** — owns the job/state machine, the datastore, and the
   gRPC contract; and
2. a **perf worker** — a Rust binary (permitted by [ADR 0007](0007-backend-languages.md))
   that lives at `services/<coordinator>/worker/` (or a clearly-named sibling
   such as `ranker/`) and consumes the coordinator's contract.

Applied:

- **`transcoding-service`** is the transcoding coordinator. The Rust ffmpeg
  worker currently at `media-service/transcoder/` **moves to
  `transcoding-service/worker/`** and claims jobs via the coordinator's gRPC
  contract (`ClaimNext` / `CompleteRung`). The duplicate Kafka
  `media.transcode.requested.v1` contract is removed.
- **`ranking-service`** is the ranking coordinator (stages 1–2 of the funnel).
  The Rust cross-encoder at `recommendation-service/ranker/` **moves to
  `ranking-service/ranker/`**. `recommendation-service` orchestrates the full
  funnel and calls `ranking-service`.

A perf worker may **not** live inside an unrelated service's directory.

## Rationale

Splitting coordination (state, contract, in Go) from computation (ffmpeg / GPU
inference, in Rust) is the right seam: it isolates the perf-critical, hard-to-
test compute, lets the worker tier scale independently, and keeps one contract.
The defect was not the split — it was that the worker was _misplaced_ and bound
to a _second_ contract. Co-locating the worker under its coordinator and binding
it to the coordinator's contract removes the duplication while keeping the
performance benefit. This is also exactly what the Phase 7/8 architecture docs
already described; the code had drifted from the docs.

## Alternatives considered

- **Single Go service does everything, no Rust worker** — loses the perf of
  native ffmpeg/CUDA; [ADR 0007](0007-backend-languages.md) explicitly allows
  Rust for this. Rejected.
- **Keep the Kafka-driven Rust transcoder, drop `transcoding-service`** — would
  discard the job state machine, the ladder, and the `transcode_jobs` table, and
  leaves "why is this video stuck" unanswerable. Rejected.
- **Worker as a wholly separate top-level service** — viable, but it fragments
  one capability across two service directories with no shared owner. The
  `coordinator/worker/` nesting keeps one capability in one place. Rejected for
  now; revisit if a worker is shared across coordinators.

## Consequences

### Positive

- One transcoding contract, one ranking contract — duplication removed.
- Perf workers are co-located with their coordinator; ownership is unambiguous.
- Coordinator and worker scale and deploy independently.

### Negative

- Real relocation work: moving `media-service/transcoder` and
  `recommendation-service/ranker`, and rewiring the transcoder to the gRPC
  contract. Tracked as TD-02/TD-10.

### Neutral / open questions

- If a future worker is genuinely shared by multiple coordinators, the
  "separate top-level service" alternative is reconsidered (a review trigger).

## Implementation rules

- A compute service is one Go coordinator + a perf worker at
  `services/<coordinator>/worker/` (or a clearly-named sibling).
- The worker consumes the coordinator's contract — it does not define its own.
- No perf worker lives inside an unrelated service's directory.
- `media-service/transcoder/` → `transcoding-service/worker/`; the Kafka
  `media.transcode.requested.v1` path is removed in favor of `ClaimNext`.
- `recommendation-service/ranker/` → `ranking-service/ranker/`.

## Agent instructions

- **Claude** — Enforce this shape in review. Update the Phase 7/8 architecture
  docs to match the relocated paths.
- **Codex** — Perform the two relocations and the transcoder contract rewire.
  Do not create a perf worker outside its coordinator's directory.
- **Composer** — No action; frontend is unaffected.
- **Copilot** — Do not scaffold transcoding or ranking workers; the homes are
  fixed by this ADR.

## Review triggers

- A perf worker needs to be shared across multiple coordinators.
- A third compute capability appears and does not fit the coordinator/worker
  shape.

## Related documents

- [0007. Backend languages: Go primary, Rust perf-critical](0007-backend-languages.md)
- [0025. Content-adaptive transcoding ladder](0025-transcoding-ladder.md)
- [0028. Media pipeline orchestrator saga](0028-media-pipeline-orchestrator.md)
- [0030. Multi-stage ranking with diversity balancing](0030-multi-stage-ranking.md)
- [Runtime boundary audit](../audits/runtime-boundary-audit.md) — RB-2, RB-3
