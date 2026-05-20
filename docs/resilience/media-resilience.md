# NEXT Media Delivery Resilience

> Media is NEXT's heaviest, most visible workload. A viewer notices a buffering
> video instantly. This document defines how upload, transcoding, and playback
> survive CDN failures, origin failures, viral spikes, and regional outages.

## 0. Doctrine

- **Playback is T0.** A viewer mid-stream keeps watching through almost any
  single failure ([graceful-degradation.md](graceful-degradation.md) §2).
- **Masters are immutable and replicated.** Everything else is regenerable
  ([ADR 0026](../adr/0026-storage-tiering.md)).
- **The edge absorbs scale.** Viral spikes and live surges are absorbed by CDN
  caching, not by origin capacity.
- **Nothing restarts from zero.** Interrupted uploads and transcodes resume.

## 1. Delivery path & its failure points

```
 viewer ──▶ CDN edge PoP ──▶ regional cache ──▶ origin (S3 renditions) ──▶ master (S3, immutable)
            │                │                  │
         miss/fail        miss/fail          miss/fail
            ▼                ▼                  ▼
       next CDN / PoP   peer-region origin   regenerate rendition from master
```

Each hop has a defined fallback; a failure cascades _down_ the chain to a slower
but working source, never to an error.

## 2. CDN failover

- **Multi-CDN** — NEXT fronts media with more than one CDN; `cdn-routing-service`
  steers viewers and can re-steer a viewer's session to a healthy CDN when one
  degrades, mid-playback.
- **PoP failover** — within a CDN, an unhealthy PoP fails over to the
  next-nearest automatically (CDN-native behavior).
- **Signed-URL continuity** — playback URLs are signed and short-TTL
  ([ADR 0027](../adr/0027-signed-playback-urls.md)); re-steering issues a fresh
  signed URL for the new edge without interrupting the session.

## 3. Origin failover

- Rendition objects live in S3 with **cross-region replication**; an origin in a
  lost region fails over to the replicated copy.
- **Masters are immutable** ([ADR 0026](../adr/0026-storage-tiering.md)) and
  cross-region replicated — a master is never lost to a regional failure.
- **Rendition regeneration** — if a specific rendition object is lost or
  corrupt, it is **re-transcoded from the master** rather than restored. The
  master is the source of truth; renditions are a derived, regenerable tier.

## 4. Adaptive-bitrate fallback

Playback degrades smoothly under network or supply pressure:

```
best available rung
  → step down the transcode ladder (ADR 0025) as throughput drops
  → serve the last buffered segment while recovering
  → audio-only continuation (severe video-path failure)
  → poster frame + graceful "resume shortly"
```

The player ([packages/video-player](../recommendation/architecture.md) — the
headless player state machine) drives this from QoE signals; the broadcast-delay
buffer for live ([live-moderation.md](../trust-safety/live-moderation.md)) also
provides a few seconds of cushion.

## 5. Edge-cache survivability

- The CDN holds the **hot set** — recently and frequently watched content.
- A cold edge (cache flush, new PoP) is a **latency event, not an outage** —
  cache misses fall through to regional cache, then origin.
- **Cache stampede protection** — on a popular cache miss, requests are
  coalesced (single-flight) so one origin fetch fills the edge for all waiting
  viewers, rather than thousands of simultaneous origin hits.
- Popular live and viral content is **pre-warmed** to edges ahead of predicted
  demand.

## 6. Upload recovery

- Uploads are **resumable, chunked** (`upload-service`, already built) — a
  dropped connection resumes from the last committed chunk, never from zero.
- Chunk commits are durable before they are acknowledged; client and server
  agree on the resume offset.
- A regional upload-endpoint failure fails the client over to another region's
  endpoint, where the resumable session can continue.

## 7. Transcoding retry

- Transcoding is a saga ([ADR 0028](../adr/0028-media-pipeline-orchestrator.md))
  with **per-stage independent retry and backoff**.
- A failed transcode rung retries on a different worker; only exhaustion of the
  **required** rung set fails the video — best-effort rungs (extra qualities)
  failing just means fewer qualities, not a failed publish.
- Transcode workers ([ADR 0037](../adr/0037-compute-coordinator-worker-split.md))
  are stateless and claim jobs from the coordinator (`ClaimNext`); a worker
  crash returns its job to the queue automatically.
- The coordinator's `pipeline_runs` table answers "where is this video" at any
  time, so a stuck transcode is visible, not silent.

## 8. Surviving spikes

### Viral spikes

A video going viral is a **read** spike. The edge absorbs it: as request volume
climbs, the content saturates more edges, and origin load stays roughly flat.
Stampede protection (§5) handles the initial miss surge. Origin and
`media-service` see modest load even when a video has tens of millions of views.

### Massive live events

A live event is a **concurrent** spike with a hard start time:

- edge capacity and live-origin capacity are **pre-provisioned** for forecast
  peak ([capacity-planning.md](capacity-planning.md));
- LL-HLS/CMAF segments are edge-cached — a million viewers of one stream is a
  small number of distinct segment objects, served from cache;
- the live pipeline degrades latency-mode before it degrades availability
  (standard-latency fallback under load);
- transcode ladder rungs can be temporarily trimmed under extreme load to
  protect the core qualities.

### Regional outage during a spike

The surviving regions carry the load (N+1 headroom, [global-topology.md](global-topology.md)
§4); the spike is served degraded (fewer rungs, higher latency) but **up**.

## 9. Failure modes & responses

| Failure                       | Response                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| CDN PoP down                  | CDN-native PoP failover; transparent                           |
| Whole CDN degraded            | `cdn-routing-service` re-steers to a healthy CDN, mid-session  |
| Origin region down            | S3 cross-region replica serves; re-point                       |
| Rendition object lost/corrupt | re-transcode from the immutable master                         |
| Transcode worker crash        | job returns to the coordinator queue; another worker claims it |
| Upload connection dropped     | resume from last committed chunk                               |
| Viral read spike              | edge absorbs; stampede protection on the miss surge            |
| Live concurrency spike        | pre-provisioned edge + segment caching; latency-mode fallback  |

## Related documents

- [graceful-degradation.md](graceful-degradation.md) · [global-topology.md](global-topology.md) · [capacity-planning.md](capacity-planning.md)
- [docs/MEDIA_ARCHITECTURE.md](../MEDIA_ARCHITECTURE.md) · ADRs [0025](../adr/0025-transcoding-ladder.md), [0026](../adr/0026-storage-tiering.md), [0027](../adr/0027-signed-playback-urls.md), [0028](../adr/0028-media-pipeline-orchestrator.md)
