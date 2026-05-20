# video-segmentation-service

CMAF segmentation + scene boundaries. Slices transcoded renditions into fixed-duration CMAF segments for ABR streaming and emits scene-cut boundaries used by clip generation and thumbnails.

Owner: `@next-ecosystem/media`.

## Internal gRPC

- `VideoSegmentationService.Segment(video_id, rendition) → SegmentManifest`
- `VideoSegmentationService.GetSegments(video_id, rendition) → []Segment`

## Events

**Emitted**: `media.segmentation.completed.v1`, `media.scene.detected.v1`, `media.processing.stage.v1`.
**Consumed**: `transcoding.rung.completed.v1`.

Partition key: `video_id`.

## Data

- Segment index in `video_segmentation` Postgres; `.m4s` segments in the media blob store.
- Default segment duration 4 s (CMAF), aligned across renditions for seamless switching.
- Scene boundaries from `scene-detection`; aligned to the nearest GOP.

## SLO

- `Segment P95 < 30 s per rendition` · `Cross-rendition segment alignment = exact`.

[Runbook](../../docs/runbooks/video-segmentation-service.md).
