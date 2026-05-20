# @next/live-control-room

Live broadcast control room: the operator surface for a running stream. Ingest health, scene switching, latency budget, live moderation overlay, and real-time viewer metrics.

## Architecture

- **Framework**: Next.js 15. Fully client-rendered — a low-latency operational console.
- **Realtime**: WebSocket/WebTransport to `live-service` for ingest telemetry + switcher commands; falls back to SSE.
- **State**: Zustand for the live control surface; TanStack Query for non-realtime config.
- **Auth**: OIDC with broadcast scopes (`live:operate`, `moderation:act`).

## Surfaces

- Ingest — RTMP/SRT/WHIP source health, bitrate, dropped frames, redundancy.
- Switcher — scene/source selection, transitions, lower-thirds.
- Latency — glass-to-glass budget; LL-HLS vs. standard-latency toggle.
- Moderation — live chat + frame moderation overlay; one-click intervention.
- Audience — concurrent viewers, QoE, geo distribution from `media-analytics-service`.

## Performance

- Realtime panels update off a single multiplexed socket; no per-panel polling.
- Operator actions are optimistic with server reconciliation.

Port `3031` in local dev.
