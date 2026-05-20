# NEXT — Media Engine Architecture

> The planetary-scale media backbone: upload, transcode, deliver, understand. Every video becomes streamable, searchable, semantically understood, and remixable.

The Media Engine is not storage + playback. It is an intelligent media nervous system. This document is the canonical reference for the media domain.

Companion to [ARCHITECTURE.md](ARCHITECTURE.md) and [IDENTITY_ARCHITECTURE.md](IDENTITY_ARCHITECTURE.md). When they conflict, this document wins for media-domain concerns.

---

## Contents

1. [Doctrine](#1-doctrine)
2. [Service map](#2-service-map)
3. [The processing pipeline](#3-the-processing-pipeline)
4. [Upload](#4-upload)
5. [Transcoding](#5-transcoding)
6. [Live streaming](#6-live-streaming)
7. [Playback + delivery](#7-playback--delivery)
8. [AI video understanding](#8-ai-video-understanding)
9. [Semantic indexing](#9-semantic-indexing)
10. [Storage tiering](#10-storage-tiering)
11. [Data architecture](#11-data-architecture)
12. [Events](#12-events)
13. [Observability](#13-observability)
14. [Security](#14-security)
15. [Scaling + DR](#15-scaling--dr)
16. [Roadmap](#16-roadmap)

---

## 1. Doctrine

Six invariants every media decision is judged against:

1. **The object store is the source of truth.** Postgres holds metadata + state; bytes live in S3. A lost database is a rebuild, not a data loss.
2. **Processing is a pipeline of idempotent stages.** Every stage can be retried, skipped, or replayed from its input. The orchestrator owns the state machine; stages own the work.
3. **Events drive the pipeline.** A stage finishing emits an event; the next stage consumes it. No synchronous chains across stages.
4. **Playback latency is sacred.** Video start P75 < 1.2 s, live glass-to-glass P75 < 3 s. Everything in the delivery path is measured against this.
5. **Every video is understood.** Speech, scenes, objects, emotion, embeddings — understanding is part of ingest, not an afterthought.
6. **Degrade, never block.** A failed thumbnail does not block publish. A failed AI stage does not block playback. The watch path survives partial failure.

---

## 2. Service map

Naming reconciled with the existing repo: `live-service` covers live streaming (the directive's `live-stream-service`); `ai/video-intelligence` is the video-understanding system.

| Service                         | Status   | Role                                                                                                              |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `upload-service`                | deep     | Resumable + chunked upload; chunk assembly; hands the assembled object to media-service.                          |
| `media-service`                 | deep     | The `Video` aggregate. Owns metadata, ownership, the processing state machine, publish lifecycle.                 |
| `media-processing-orchestrator` | deep     | Drives a video through ingest → transcode → thumbnail → subtitle → index. Event-driven saga.                      |
| `transcoding-service`           | deep     | Transcode job queue + bitrate ladder. Dispatches GPU workers (Rust transcoder lives in media-service/transcoder). |
| `playback-service`              | scaffold | Issues signed manifests + playback sessions; QoE telemetry sink.                                                  |
| `cdn-routing-service`           | scaffold | Geo-aware edge selection; signed-URL minting.                                                                     |
| `media-metadata-service`        | scaffold | Denormalised read model of media metadata for fast catalog reads.                                                 |
| `thumbnail-service`             | scaffold | Keyframe extraction + sprite sheets.                                                                              |
| `subtitle-service`              | scaffold | ASR-derived subtitle tracks; multi-language.                                                                      |
| `media-search-service`          | scaffold | Media-specific search over transcripts + semantic index.                                                          |
| `video-segmentation-service`    | scaffold | Shot/scene boundary detection feeding clip generation.                                                            |
| `clip-generation-service`       | scaffold | Highlight + short-clip extraction.                                                                                |
| `media-analytics-service`       | scaffold | Playback + QoE analytics → ClickHouse.                                                                            |
| `live-service`                  | exists   | Live ingest + distribution (Phase 2).                                                                             |

```
   client
     │ TUS resumable upload
     ▼
 upload-service ──assembled──► S3 ──media.video.ingested.v1──► orchestrator
                                                                 │
              ┌──────────────────────────────────────────────────┤
              ▼                  ▼                  ▼            ▼
      transcoding-service  thumbnail-service  subtitle-service  ai/video-intelligence
              │                  │                  │            │
              └──────────────────┴──────────────────┴────────────┘
                                  │ all stages done
                                  ▼
                     media-service marks PUBLISHED
                                  │
                                  ▼
                  playback-service + cdn-routing-service → viewer
```

---

## 3. The processing pipeline

A video moves through a deterministic state machine owned by `media-service`, coordinated by `media-processing-orchestrator`:

```
UPLOADING → UPLOADED → INGESTED → PROCESSING → READY → PUBLISHED
                                      │
                                      └─(any stage hard-fails)→ FAILED
```

- **UPLOADING** — chunks landing in upload-service.
- **UPLOADED** — chunk assembly complete; object in S3.
- **INGESTED** — media-service has created the `Video` row; `media.video.ingested.v1` emitted.
- **PROCESSING** — orchestrator has dispatched the stage fan-out (transcode / thumbnail / subtitle / understanding).
- **READY** — all _required_ stages succeeded (transcode is required; thumbnail/subtitle/AI are best-effort).
- **PUBLISHED** — creator (or schedule) made it visible; `media.video.published.v1` emitted.
- **FAILED** — a required stage exhausted retries.

The orchestrator is a **saga**: it records per-stage status, retries failed stages independently, and only advances `media-service` to `READY` when the required set is green.

---

## 4. Upload

`upload-service` implements **resumable, chunked upload** (TUS-protocol-aligned, per ADR 0028 reference).

- **Create** — client opens an upload session declaring total size + content type. Service allocates an S3 multipart upload.
- **Chunk** — client `PATCH`es chunks at byte offsets; out-of-order and parallel chunks are allowed. Each chunk is an S3 part.
- **Resume** — `HEAD` returns the highest contiguous offset; the client resumes from there. Survives app restarts and network drops.
- **Finalize** — when all parts are present, the service completes the S3 multipart upload, runs a virus scan, and emits `upload.session.completed.v1`.

Quotas + viral-upload rate-limits keyed on `creator_id`. Mobile resilience: chunk size adapts to observed throughput.

---

## 5. Transcoding

`transcoding-service` owns the **bitrate ladder** and the job queue. The actual encode runs in the Rust transcoder (`services/media-service/transcoder`) on GPU workers.

Default ladder (per ADR 0025):

| Rung | Resolution | Codec       | Bitrate  |
| ---- | ---------- | ----------- | -------- |
| 0    | 360p       | H.264       | 0.8 Mbps |
| 1    | 480p       | H.264       | 1.4 Mbps |
| 2    | 720p       | H.264 + AV1 | 3.0 Mbps |
| 3    | 1080p      | H.264 + AV1 | 6.0 Mbps |
| 4    | 1440p      | AV1         | 12 Mbps  |
| 5    | 2160p      | AV1         | 24 Mbps  |

- Ladder is **content-adaptive**: a static talking-head video drops the high rungs; high-motion content keeps them.
- Output is **CMAF** segments addressable by both HLS and DASH manifests.
- Vertical (shorts) and cinematic widescreen are first-class ladder variants.
- HDR rungs (HLG / PQ) are generated when the source is HDR.

---

## 6. Live streaming

Handled by `live-service` (Phase 2). The Media Engine integrates at two points:

- **Live → VOD** — a finished broadcast becomes a normal `Video` via `media.video.ingested.v1`, entering the same pipeline.
- **Live clipping** — `clip-generation-service` can cut a clip from an in-progress stream's segment buffer.

Ultra-low-latency live uses LL-HLS / LL-DASH with CMAF chunked transfer; target glass-to-glass P75 < 3 s.

---

## 7. Playback + delivery

`playback-service` issues signed playback manifests; `cdn-routing-service` picks the edge.

- **Manifest** — per-session HLS/DASH manifest with signed segment URLs (short-TTL, per ADR 0027).
- **ABR** — the player (`@next/video-player`) runs adaptive bitrate; the server only publishes the ladder.
- **Edge** — CloudFront in front of S3 for VOD; `cdn-routing-service` does geo-aware POP selection + signed-URL minting.
- **QoE** — the player streams `playback.*` telemetry; `media-analytics-service` aggregates into the QoE dashboards.

SLOs: video start P75 < 1.2 s, rebuffer ratio < 0.5 %, manifest P95 < 80 ms.

---

## 8. AI video understanding

`ai/video-intelligence` (Phase 2) runs the understanding pipeline. The Media Engine triggers it via `media.video.ingested.v1`. Stages:

- **Speech** — Whisper-class ASR → transcript + word timestamps + speaker separation → feeds `subtitle-service`.
- **Vision** — shot detection (TransNetV2), object detection (YOLO), face detection, visual embeddings.
- **Semantic** — topic extraction, narrative + emotion analysis, content classification.
- **Highlight** — viral-moment detection + engagement prediction → feeds `clip-generation-service`.

Understanding is **best-effort** in the publish path — a video can be `PUBLISHED` before AI completes; the enrichments land asynchronously.

---

## 9. Semantic indexing

Every video becomes semantically searchable:

- Multimodal embeddings (text + vision + audio, 1024-d, CLIP-XL aligned — same space as `semantic-understanding`).
- Embeddings upserted to **Qdrant** via `vector-pipelines`, keyed by `video_id`.
- Transcripts indexed in **OpenSearch** for keyword + phrase search.
- `media-search-service` does hybrid retrieval: BM25 (transcript) + vector recall, then LTR re-rank.

---

## 10. Storage tiering

Per ADR 0026:

| Tier     | Backing             | Holds                                              | Lifecycle       |
| -------- | ------------------- | -------------------------------------------------- | --------------- |
| **Hot**  | S3 Standard         | source + active renditions, last 30 days of access | always          |
| **Warm** | S3 Standard-IA      | renditions not accessed in 30 days                 | auto-transition |
| **Cold** | S3 Glacier Flexible | source masters, archival                           | after 365 days  |
| **Edge** | CloudFront cache    | hot segments                                       | TTL-driven      |

Source masters are **never deleted** — re-transcoding to a future codec must always be possible. Renditions are disposable and regenerable.

---

## 11. Data architecture

| Store                         | Service                    | Purpose                                                   |
| ----------------------------- | -------------------------- | --------------------------------------------------------- |
| Postgres `upload`             | upload-service             | upload_sessions, upload_parts                             |
| Postgres `media`              | media-service              | videos, renditions, processing_state                      |
| Postgres `transcoding`        | transcoding-service        | transcode_jobs                                            |
| Postgres `media_orchestrator` | orchestrator               | pipeline_runs, stage_status                               |
| Redis                         | playback, upload           | playback sessions, chunk-assembly scratch, manifest cache |
| ClickHouse `media_analytics`  | media-analytics            | playback + QoE events                                     |
| OpenSearch                    | media-search               | transcript + metadata index                               |
| Qdrant                        | (via vector-pipelines)     | video embeddings keyed by video_id                        |
| S3                            | upload, media, transcoding | source masters, renditions, thumbnails, subtitles         |

One database per service (per [ADR 0017](adr/0017-database-per-service.md)). Migrations forward-only.

---

## 12. Events

Adds to the topic catalog ([event-architecture.md](event-architecture.md)):

```
upload.session.started.v1        (exists)
upload.session.completed.v1      (exists)

media.video.ingested.v1          (exists; now carries source object key)
media.video.transcoded.v1        (exists; per-rendition)
media.video.published.v1         (exists)
media.video.deleted.v1           (exists)
media.video.viewed.v1            (exists)

media.processing.started.v1      NEW — orchestrator opened a pipeline run
media.processing.stage.v1        NEW — a stage completed (transcode/thumbnail/subtitle/ai)
media.processing.completed.v1    NEW — all required stages green; video READY
media.processing.failed.v1       NEW — a required stage hard-failed

media.thumbnail.generated.v1     NEW
media.subtitle.generated.v1      NEW
media.clip.generated.v1          NEW
media.highlight.detected.v1      NEW
media.semantic.indexed.v1        NEW

playback.started.v1              NEW
playback.buffered.v1             NEW
playback.completed.v1            NEW
```

Partition key: `video_id` for `media.*`, `session_id` for `playback.*`.

---

## 13. Observability

Dashboards (Grafana JSON in `infrastructure/monitoring/grafana/dashboards/`):

| Dashboard            | Signals                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `media-pipeline`     | ingest rate, stage durations, stage failure rate, queue depth             |
| `media-transcoding`  | jobs/min, GPU utilization, encode speed (× realtime), ladder distribution |
| `media-playback-qoe` | video start time, rebuffer ratio, bitrate distribution, error rate        |
| `media-storage`      | hot/warm/cold bytes, lifecycle transitions, egress cost                   |
| `media-live`         | glass-to-glass latency, concurrent streams, ingest health                 |

SLOs:

| SLO                          | Target                   |
| ---------------------------- | ------------------------ |
| Video start P75              | < 1.2 s                  |
| Rebuffer ratio               | < 0.5 %                  |
| Ingest → first rendition P95 | < 60 s                   |
| Manifest P95                 | < 80 ms                  |
| Live glass-to-glass P75      | < 3 s                    |
| Pipeline completion P95      | < 5 min (≤ 10 min video) |

---

## 14. Security

| Control           | Implementation                                                        |
| ----------------- | --------------------------------------------------------------------- |
| Signed media URLs | CloudFront signed URLs, short TTL, per playback session               |
| Upload validation | content-type sniffing + size cap + ClamAV scan on finalize            |
| DRM               | Widevine / FairPlay / PlayReady via a license proxy (Phase 9)         |
| Copyright         | perceptual-hash matching against a fingerprint store (Phase 9)        |
| Watermarking      | forensic per-session watermark for premium content (Phase 10)         |
| Access control    | playback manifests gated through the access-control PDP               |
| Abuse             | per-creator upload quota + rate-limit; viral-upload anomaly detection |

---

## 15. Scaling + DR

- **Transcoding** scales on queue depth via KEDA → Karpenter GPU pools (`gpu-batch`, spot-friendly).
- **Upload** is horizontal + stateless; chunk-assembly scratch in Redis.
- **Playback** is read-heavy — CDN absorbs the bulk; `playback-service` scales on manifest request rate.
- **Storage** is effectively unlimited (S3); cost is managed by the tiering lifecycle.

DR (per [disaster-recovery.md](disaster-recovery.md)):

- Source masters: S3 versioning + cross-region replication. RPO 0.
- Metadata: Postgres PITR, 35-day window.
- Renditions: regenerable from masters — not backed up, re-transcoded on loss.
- Pipeline state: orchestrator runs are replayable from `media.*` events.

---

## 16. Roadmap

| Phase | Deliverable                                                                     | Status         |
| ----- | ------------------------------------------------------------------------------- | -------------- |
| 7     | Media architecture + deep upload/media/transcoding/orchestrator + scaffolds     | **this phase** |
| 8     | Real GPU transcoding, thumbnail + subtitle services, playback-service manifests | next           |
| 9     | DRM, copyright fingerprinting, cdn-routing geo selection                        |                |
| 10    | Forensic watermarking, clip-generation from highlight model, spatial-video prep |                |
| 11    | Volumetric / immersive media pipeline                                           |                |

Anything that violates [§1 Doctrine](#1-doctrine) — especially the playback-latency invariant — does not ship.
