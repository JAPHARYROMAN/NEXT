# 0025. Content-adaptive transcoding ladder, CMAF output

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/media
- **Tags**: media, transcoding

## Context

Every uploaded video must be playable on a 360p phone on a slow network and a 4K TV on fibre. A fixed bitrate ladder wastes encode cost + storage on content that doesn't need the high rungs (a static talking head) and under-serves high-motion content.

## Decision

- A **6-rung default ladder** (360p → 2160p), H.264 on the low rungs for device reach, AV1 on the high rungs for efficiency.
- The ladder is **content-adaptive**: a complexity probe on ingest drops rungs that wouldn't improve perceived quality.
- Output is **CMAF** segments — one set of segments addressable by both HLS and DASH manifests. No double storage.
- Vertical (shorts) and cinematic widescreen are first-class ladder variants. HDR rungs generated when the source is HDR.

## Alternatives considered

- **Fixed ladder** — simplest, wastes 20-40 % of encode + storage cost at our scale.
- **Per-title encoding (full convex-hull search)** — best quality-per-bit, but the search cost is high; we use a cheaper complexity probe that captures most of the gain.
- **Separate HLS + DASH renditions** — doubles storage. CMAF eliminates it.

## Consequences

### Positive

- Encode + storage cost scales with content complexity, not a fixed worst case.
- One segment set serves every player.
- AV1 on high rungs cuts egress cost meaningfully.

### Negative

- AV1 encode is CPU/GPU-expensive; mitigated by SVT-AV1 on GPU workers and keeping AV1 to the high rungs only.
- Content-adaptive ladders make storage forecasting fuzzier.

## Implementation notes

- `transcoding-service` owns the ladder definition + job queue; the Rust transcoder does the encode.
- Probe runs as job rung 0; remaining rungs dispatched based on its output.
- Source master is always retained for future re-transcode (see ADR 0026).
