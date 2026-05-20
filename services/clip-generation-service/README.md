# clip-generation-service

Clip + highlight reel generation. Cuts shareable clips from a published video — either user-specified ranges or AI-suggested highlights from `highlight-detection`.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `createClip(video_id, start_ms, end_ms)` mutation — user-cut clip.
- `videoClips(video_id)` — clips for a video.

## Internal gRPC

- `ClipGenerationService.CreateClip(video_id, range, source) → Clip`
- `ClipGenerationService.GetClip(clip_id) → Clip`
- `ClipGenerationService.ListClips(video_id) → []Clip`

## Events

**Emitted**: `media.clip.created.v1`, `media.highlight.generated.v1`.
**Consumed**: `media.video.published.v1`, `ai.highlight.detected.v1`.

Partition key: `video_id`.

## Data

- `clips` rows in `clip_generation` Postgres; clip renditions in the media blob store.
- A clip is a new lightweight `Video` (kind=`clip`) referencing its parent.

## SLO

- `CreateClip P95 < 20 s` · `Highlight reel auto-published P95 < 5 min after publish`.

[Runbook](../../docs/runbooks/clip-generation-service.md).
