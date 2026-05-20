# @next/studio-media-console

Creator media console: the video library + processing cockpit. Where creators watch an upload move through ingest → transcode → enrich → publish, manage renditions, cut clips, and read per-video analytics.

## Architecture

- **Framework**: Next.js 15. Client-rendered — this is an operational dashboard, not content browsing.
- **State**: TanStack Query for cloud sync against the GraphQL gateway; Zustand for transient view state.
- **Pipeline visibility**: subscribes to `media.processing.stage.v1` projections via the gateway; renders the saga (ADR 0028) per video as a live stage timeline.
- **Upload**: resumable uploads via [`tus-js-client`](https://github.com/tus/tus-js-client) against `upload-service`.
- **Auth**: same OIDC as web, with creator scopes (`creator:write`, `media:write`).

## Surfaces

- Library — every video with its `ProcessingState` and required-stage health.
- Renditions — the transcoding ladder per video; re-run a failed rung.
- Clips — propose/cut clips; review `highlight-detection` suggestions.
- Analytics — retention curves + QoE from `media-analytics-service`.

## Performance

- Lazy-load per-surface bundles; virtualize the library list.
- Stage timeline updates over a single multiplexed subscription.

Port `3030` in local dev.
