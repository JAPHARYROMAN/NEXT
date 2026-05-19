# media-service

Video object model + asset lifecycle. The video record's source of truth. Hosts the Go control plane; the Rust transcoder lives at [`media-service/transcoder`](transcoder).

Owner: `@next-ecosystem/media`.

## Components
- **`cmd/server` (Go)** — gRPC + GraphQL subgraph. Manages `Video` aggregate, kicks off transcode jobs, emits lifecycle events.
- **`transcoder` (Rust)** — pulls from a transcode queue, uses ffmpeg + SVT-AV1 + libx264, writes outputs to S3, reports back via Kafka.

## Public API (GraphQL subgraph)
- `Video`, `VideoRendition`, `VideoChapter` types.
- `publishVideo(id, input)`, `updateVideo(id, patch)`, `deleteVideo(id)`.

## Internal gRPC
- `VideoService.Get(videoId) → Video`
- `VideoService.Publish(videoId) → Video`
- `RenditionService.List(videoId) → Rendition[]`

## Events
**Emitted**: `media.video.ingested.v1`, `media.video.transcoded.v1`, `media.video.published.v1`, `media.video.deleted.v1`, `media.video.viewed.v1`.
**Consumed**: `upload.session.completed.v1` (kicks off ingest).

Partition key: `video_id`.

## Data
- `videos`, `renditions`, `chapters`, `transcode_jobs` in `media_pg`.
- Source + rendition objects in `s3://next-media-<env>/{videos,renditions}/<video_id>/`.

## SLO
- `Video page first byte P95 < 100 ms` · `Ingest → first rendition P95 < 60 s` · `Publish write P95 < 200 ms`.

[Runbook](../../docs/runbooks/media-service.md).
