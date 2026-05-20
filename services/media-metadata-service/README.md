# media-metadata-service

Canonical media metadata catalog. Owns descriptive, structural, and rights metadata for every video — chapters, captions catalog, language, content rating, attribution.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `videoMetadata(video_id)` — full metadata bundle.
- `updateVideoMetadata(input)` mutation — creator edits (title, description, chapters).

## Internal gRPC

- `MediaMetadataService.Get(video_id) → Metadata`
- `MediaMetadataService.Upsert(video_id, metadata)`
- `MediaMetadataService.ListChapters(video_id) → []Chapter`

## Events

**Emitted**: `media.metadata.updated.v1`.
**Consumed**: `media.video.ingested.v1`, `media.video.published.v1`, `media.processing.stage.v1` (subtitle/understand stages enrich metadata).

Partition key: `video_id`.

## Data

- `video_metadata`, `chapters`, `caption_tracks` in `media_metadata` Postgres.
- Source of truth for the metadata block; `media-service` keeps only lifecycle state.

## SLO

- `Get P95 < 40 ms` · `Metadata-update propagation P95 < 3 s`.

[Runbook](../../docs/runbooks/media-metadata-service.md).
