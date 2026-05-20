# 0026. Media storage tiering; masters are immutable

- **Status**: Accepted
- **Date**: 2026-05-20
- **Deciders**: @next-ecosystem/media @next-ecosystem/sre
- **Tags**: media, storage

## Context

A planetary media library is mostly cold. The long tail of videos is rarely watched, but the head is watched constantly. Storing everything in hot storage is wasteful; storing everything cold kills playback latency.

## Decision

Four tiers, lifecycle-managed:

- **Hot** (S3 Standard) — source masters + active renditions, last 30 days of access.
- **Warm** (S3 Standard-IA) — renditions not accessed in 30 days.
- **Cold** (S3 Glacier Flexible) — source masters after 365 days.
- **Edge** (CloudFront) — hot segments, TTL-driven.

**Source masters are immutable and never deleted.** Renditions are disposable — regenerable from the master by re-running the transcoder.

## Alternatives considered

- **Single hot tier** — simplest, expensive at petabyte scale.
- **Delete masters, keep only renditions** — saves cold-storage cost but makes future codec migration impossible. Rejected: when AV2 ships we must be able to re-encode the whole library.
- **Cloudflare R2 instead of S3** — zero egress is attractive; we stay on S3 for v1 to keep one cloud (ADR 0002) and revisit for the delivery tier.

## Consequences

### Positive

- Storage cost tracks access pattern, not raw library size.
- Renditions lost to a failure are re-transcoded, not restored — no rendition backup needed.
- Future codec migration is always possible from masters.

### Negative

- Glacier retrieval latency (minutes-to-hours) means a cold master re-transcode is not instant. Acceptable — it's a rare batch operation.
- Lifecycle rules need monitoring so nothing transitions that shouldn't.

## Implementation notes

- Lifecycle rules in the `s3-bucket` Terraform module (`lifecycle_to_ia_days`, `lifecycle_to_glacier_days`).
- `next-media-<env>` bucket: masters under `masters/`, renditions under `renditions/`, thumbnails under `thumbs/`.
- Versioning on; cross-region replication for masters (RPO 0).
