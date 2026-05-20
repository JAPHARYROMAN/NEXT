# thumbnail-service

Thumbnail + preview generation. Produces poster frames, hover sprite sheets, and short animated previews from transcoded renditions. A best-effort pipeline stage (ADR 0028 — does not gate `READY`).

Owner: `@next-ecosystem/media`.

## Internal gRPC

- `ThumbnailService.Generate(video_id, source_url) → ThumbnailSet`
- `ThumbnailService.GetSprite(video_id) → SpriteSheet`
- `ThumbnailService.GetPoster(video_id, time_ms) → PosterFrame`

## Events

**Emitted**: `media.thumbnail.ready.v1`, `media.processing.stage.v1` (stage=`thumbnail`).
**Consumed**: `media.video.ingested.v1`.

Partition key: `video_id`.

## Data

- Generated assets written to the media blob store; manifest rows in `thumbnail` Postgres.
- Default: 1 poster + a 10×10 sprite grid at 1 fps + a 3 s WebP preview.

## SLO

- `Generate P95 < 8 s` · stage failure is non-fatal (cosmetic).

[Runbook](../../docs/runbooks/thumbnail-service.md).
