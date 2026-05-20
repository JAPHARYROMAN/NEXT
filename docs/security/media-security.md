# Media Security

> Protecting what creators make and what viewers watch — content access,
> upload safety, anti-piracy, and the integrity of live streams — without
> turning playback into a hostile, DRM-choked experience.

## 0. Principle

Media security protects three things: a **creator's content** from theft, a
**premium purchase** from being bypassed, and a **viewer** from malicious media.
It does so with the lightest mechanism that works — NEXT does not reach for
heavy DRM where a signed URL suffices, and never lets security degrade the
playback experience for honest viewers.

Grounded in [ADR 0027](../adr/0027-signed-playback-urls.md) (signed playback
URLs) and the media engine ([docs/MEDIA_ARCHITECTURE.md](../MEDIA_ARCHITECTURE.md)).

## 1. Playback authorization

- Playback is authorized **before** a signed URL is issued: the viewer's right
  to the content is checked against `media-service` visibility and the
  `access-control` PDP ([ADR 0022](../adr/0022-access-control-rego.md)) —
  region, age-gate, and, for premium content, the **entitlement**
  ([docs/economy/entitlements.md](../economy/entitlements.md)).
- Authorization is at session start; an in-progress stream is not re-gated
  mid-playback ([docs/economy/entitlements.md](../economy/entitlements.md) §5).
- Free content has no entitlement gate — it plays; security is not friction
  where there is nothing to protect.

## 2. Signed playback URLs

- Playback URLs are **signed and short-TTL**, per-session ([ADR 0027](../adr/0027-signed-playback-urls.md)).
- A signed URL is **scoped** — to a session, a viewer, and a short expiry — so a
  leaked URL is useless within minutes and to anyone else.
- Signing keys are held at the CDN edge config / Vault; rotated per ADR 0027.
- Re-steering a session to another CDN issues a **fresh** signed URL
  ([docs/resilience/media-resilience.md](../resilience/media-resilience.md)) —
  the signature travels with the session, not the asset.

## 3. Upload validation

Uploads are untrusted input — a creator (or an attacker posing as one) can
upload anything. Every upload is:

- **type- and size-validated** at `upload-service` — declared content type
  matches actual content; size within bounds;
- **scanned for malicious content** — known-bad media hashes and a malware scan
  before the file enters the processing pipeline;
- **resumable but bounded** — the resumable-chunk protocol does not let an
  attacker stage an unbounded or malformed object.

A failed validation rejects the upload; it does not reach transcoding.

## 4. Transcoding isolation

- Transcoding processes **untrusted media** through `ffmpeg`-class tooling —
  historically a rich exploit surface (malformed-container, codec bugs).
- Therefore transcode workers run **sandboxed and isolated**: least-privilege,
  no production network access beyond what the job needs, resource-bounded,
  ideally ephemeral per job ([infrastructure-hardening.md](infrastructure-hardening.md)).
- A compromised transcode of one malicious file is **contained** to that
  worker — it cannot pivot into the platform. "Assume breach" applied to the
  most exposed compute in NEXT.

## 5. Anti-piracy

NEXT's anti-piracy posture is **layered and proportionate**:

- **Signed short-TTL URLs** (§2) make casual link-sharing ineffective — a shared
  URL dies in minutes.
- **Forensic watermarking** — premium and high-value content can carry a
  per-session, invisible **forensic watermark**, so a leaked re-recording can be
  traced to the leaking session. Watermarking deters; it does not block the
  honest viewer.
- **Abuse detection** — bulk/automated download patterns are a risk signal
  ([security-observability.md](security-observability.md),
  [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)).
- **DRM compatibility** — the media architecture is designed so that
  standards-based DRM _can_ be applied to content that genuinely requires it
  (e.g. licensed premium catalog), without DRM being imposed on the ordinary
  creator's ordinary video. DRM is an option for the content that needs it, not
  a default tax on everything.

The deliberate stance: protect content with the lightest effective mechanism;
do not punish every viewer to deter the few.

## 6. Livestream integrity

- Live ingest is authenticated — a stream key is a secret, scoped to the
  creator, revocable; a leaked key is rotated.
- The broadcast path is integrity-protected; the live moderation pipeline
  ([docs/trust-safety/live-moderation.md](../trust-safety/live-moderation.md))
  also serves stream integrity — hijack or injection attempts surface as
  anomalies.
- Live signed URLs and segment access follow the same model as VOD (§2).

## 7. Creator content protection

- A creator's **masters are immutable** ([ADR 0026](../adr/0026-storage-tiering.md))
  and access-controlled — they are never publicly reachable.
- Content access (who may view, embed, download) is the creator's setting,
  enforced by the PDP.
- Impersonation and content-theft (re-uploading a creator's catalog) are
  detected by trust & safety ([docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md)).

## 8. Prohibited patterns

- ✗ An unsigned or long-lived playback URL.
- ✗ Issuing a playback URL before authorization.
- ✗ Transcoding untrusted media in an un-isolated, privileged worker.
- ✗ Skipping malicious-media scanning on upload.
- ✗ A publicly reachable master object.
- ✗ Imposing heavy DRM on ordinary creator content as a default.
- ✗ A non-revocable or shared live stream key.

## Related

- [ADR 0027](../adr/0027-signed-playback-urls.md) · [docs/MEDIA_ARCHITECTURE.md](../MEDIA_ARCHITECTURE.md) · [docs/economy/entitlements.md](../economy/entitlements.md) · [infrastructure-hardening.md](infrastructure-hardening.md) · [docs/trust-safety/live-moderation.md](../trust-safety/live-moderation.md)
