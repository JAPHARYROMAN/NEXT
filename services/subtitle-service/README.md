# subtitle-service

Subtitle + caption track authority. Stores creator-uploaded tracks and ASR-derived tracks from `speech-transcription`, serves WebVTT, and manages per-language translations.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `subtitleTracks(video_id)` — available languages + kinds.
- `uploadSubtitleTrack(input)` mutation — creator-supplied VTT/SRT.

## Internal gRPC

- `SubtitleService.GetTrack(video_id, language) → Track`
- `SubtitleService.ListTracks(video_id) → []Track`
- `SubtitleService.UpsertTrack(video_id, track)`

## Events

**Emitted**: `media.subtitle.ready.v1`, `media.processing.stage.v1` (stage=`subtitle`).
**Consumed**: `media.video.ingested.v1`, `ai.speech.transcribed.v1`.

Partition key: `video_id`.

## Data

- `subtitle_tracks` rows in `subtitle` Postgres; VTT payloads in the media blob store.
- Auto tracks flagged `auto = true`; creator uploads override on the same language.

## SLO

- `GetTrack P95 < 50 ms` · `ASR track availability P95 < 2 min after transcode`.

[Runbook](../../docs/runbooks/subtitle-service.md).
