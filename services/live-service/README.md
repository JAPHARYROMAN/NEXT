# live-service

Live ingest, transcode, distribution. Glass-to-glass target < 3 s.

Owner: `@next-ecosystem/streaming`. Components:
- **`ingest/` (Rust)** — RTMP / WebRTC / SRT receiver. Hot path; Rust for tail latency.
- **`cmd/server/` (Go)** — control plane: creates streams, manages keys, emits events.

## Public API (GraphQL subgraph)
- `LiveStream`, `LiveBroadcaster`, `LiveChatMessage` types.
- `startStream(input)`, `endStream(streamId)`.
- Subscription: `liveChat(streamId)`.

## Internal gRPC
- `LiveService.CreateStream(creator_id) → LiveStream` (returns ingest URL + stream key).
- `LiveService.EndStream(stream_id)`.
- `LiveService.RotateKey(stream_id)`.

## Events
**Emitted**: `live.stream.started.v1`, `live.stream.ended.v1`, `live.chat.message.v1`.
**Consumed**: `auth.session.ended.v1`.

Partition key: `stream_id`.

## Data
- Stream state in `live_redis` (active sessions, viewer counts).
- Recorded segments in `s3://next-live-<env>/streams/<id>/`.

## Distribution
- LL-HLS (default) + LL-DASH (canary via `live.glass-to-glass-ll-hls` flag).
- CMAF segments; chunked transfer at the CDN.

## SLO
- `Stream create P95 < 200 ms` · `Glass-to-glass P75 < 3.0 s` · `Ingest availability > 99.9 %`.

[Runbook](../../docs/runbooks/live-service.md).
