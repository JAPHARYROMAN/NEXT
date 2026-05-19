# upload-service

Resumable uploads. Speaks the [TUS](https://tus.io) protocol; chunks land directly in S3 via signed multi-part uploads.

Owner: `@next-ecosystem/media`.

## Public API
- `POST /uploads` (create session) → returns upload URL.
- `PATCH /uploads/:id` (chunk).
- `HEAD /uploads/:id` (resume info).

## Internal gRPC
- `UploadService.CreateSession(input) → Session`
- `UploadService.Finalize(sessionId) → AssetRef`

## Events
**Emitted**: `upload.session.started.v1`, `upload.session.completed.v1`.
**Consumed**: `auth.session.ended.v1` (invalidates pending uploads).

Partition key: `creator_id`.

## Data
- Session metadata in `upload_pg` (`upload_sessions`, `upload_parts`).
- Object chunks in `s3://next-uploads-<env>/sessions/<id>/`.

## SLO
- `Session create P95 < 100 ms` · `Chunk PATCH P95 < 500 ms (1 MB chunk)` · `Resume HEAD P99 < 50 ms`.

## Security
- Per-creator quota; viral upload rate-limit on `auth.user_id`.
- Virus scan via ClamAV sidecar on finalize before emitting `completed`.

[Runbook](../../docs/runbooks/upload-service.md).
