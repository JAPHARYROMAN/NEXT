# 0028. Media processing as an event-driven orchestrator saga

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/media
- **Tags**: media, events, orchestration

## Context

Turning an uploaded file into a published video is a multi-stage pipeline: ingest → transcode (required) → thumbnail → subtitle → AI understanding → semantic index. Stages have different durations (transcode minutes, thumbnail seconds), different failure modes, and different criticality (transcode is required for playback; a missing thumbnail is cosmetic).

## Decision

`media-processing-orchestrator` runs the pipeline as an **event-driven saga**:

- It records a `pipeline_run` per video with per-stage status rows.
- Each stage is dispatched independently; stages fan out in parallel where they have no dependency.
- A stage completing emits `media.processing.stage.v1`; the orchestrator updates its row.
- The orchestrator advances `media-service` to `READY` only when the **required** stage set (transcode) is green — best-effort stages (thumbnail, subtitle, AI) do not gate `READY`.
- Failed stages retry independently with backoff; only a required-stage exhaustion moves the video to `FAILED`.

## Alternatives considered

- **Synchronous pipeline** — one service calling the next. A slow transcode blocks the whole chain; one failure fails everything; no parallelism.
- **A workflow engine (Temporal / Cadence)** — powerful, but another stateful system to operate. Our stages are coarse and few; an event-driven saga on the existing Kafka bus is enough for v1. Revisit if the pipeline grows complex branching.
- **Chained Kafka consumers with no coordinator** — works, but no single place sees pipeline state, making "why is this video stuck" unanswerable.

## Consequences

### Positive

- Stages run in parallel; pipeline latency is `max(stage)` not `sum(stage)`.
- Partial failure is graceful — a video publishes without a thumbnail rather than not at all.
- The `pipeline_run` table is the one place to answer "where is this video".
- Replayable: re-emit `media.video.ingested.v1` to re-run the pipeline.

### Negative

- The orchestrator is a coordination point — needs its own SLO + oncall.
- Eventually-consistent enrichment: a video can be `PUBLISHED` before its AI tags land. Acceptable by doctrine (degrade, never block).

## Implementation notes

- `pipeline_runs` + `stage_status` tables in `media_orchestrator` Postgres.
- Required stages configurable per content type; default required = `{transcode}`.
- Orchestrator consumes `media.video.ingested.v1` + every `media.processing.stage.v1`; emits `media.processing.{started,completed,failed}.v1`.
- Phase 7 ships the orchestrator with the state machine + dispatch contracts; real GPU transcode workers land in Phase 8.
