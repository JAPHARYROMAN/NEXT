# 0027. Signed, short-TTL playback URLs per session

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/media @next-ecosystem/security
- **Tags**: media, security, playback

## Context

Media segments live in S3 behind CloudFront. They must be reachable fast by an authorized viewer and not be a permanent public link that can be scraped, hot-linked, or shared past the viewer's access window.

## Decision

- `playback-service` issues a **per-session manifest**. Segment URLs in it are **CloudFront signed URLs** with a short TTL (default 6 hours, ≥ the longest expected single view).
- The manifest request is gated through the access-control PDP — visibility (`public`/`unlisted`/`private`), region restrictions, and age gates are enforced before a manifest is minted.
- Signing keys are managed in the CDN edge config; rotation is a config push.

## Alternatives considered

- **Public segment URLs** — fastest, zero auth cost, but no access control and trivially hot-linkable.
- **Token-per-segment** — strongest, but a signing round-trip per segment hurts the latency budget.
- **DRM for everything** — overkill for the bulk of content; DRM is reserved for premium (Phase 9).

Per-session signed manifests are the balance: one signing operation per view, no per-segment round-trip, real expiry.

## Consequences

### Positive

- Segments are not permanently public; links expire.
- Access control is evaluated once per session, off the per-segment hot path.
- No DRM overhead for ordinary content.

### Negative

- A signed URL is still shareable within its TTL window. Acceptable for non-premium content; premium uses DRM + forensic watermarking (Phase 9/10).
- Manifest must be regenerated when the session's signed URLs expire mid-view of a very long video — the player refetches.

## Implementation notes

- `cdn-routing-service` mints the signed URLs + picks the POP.
- TTL configurable per content tier; premium content gets DRM instead.
- Manifest cache in Redis keyed by `(video_id, ladder_version, region)` — signing is cheap, composition is cached.
