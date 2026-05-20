# playback-service

Playback session authority. Issues signed, short-TTL playback URLs (ADR 0027), authorizes viewers against `media-service` visibility + `access-control-service` policy, and ingests client QoE.

Owner: `@next-ecosystem/media`.

## Public API (GraphQL subgraph)

- `playbackSession(input)` — start a session, returns a signed manifest URL + session token.
- `playbackQoE(input)` mutation — client streams QoE counters from `@next/player-controls`.

## Internal gRPC

- `PlaybackService.StartSession(video_id, viewer_id, device) → SignedManifest`
- `PlaybackService.GetManifest(session_id) → ManifestURL`
- `PlaybackService.ReportQoE(session_id, qoe)`
- `PlaybackService.EndSession(session_id)`

## Events

**Emitted**: `playback.session.started.v1`, `playback.session.ended.v1`, `playback.qoe.sampled.v1`.
**Consumed**: `media.video.published.v1`, `media.video.deleted.v1`.

Partition key: `video_id`.

## Data

- `playback_sessions` in `playback` Postgres (session id, viewer, video, signed-url expiry).
- Signing keys from Vault; rotated per ADR 0027.

## SLO

- `StartSession P95 < 120 ms` · `Signed-URL forgery rate = 0`.

[Runbook](../../docs/runbooks/playback-service.md).
