# Upload Experience

Phase 9 delivers a **cinematic upload flow** (UI only).

## Flow

1. **Drop zone** — `UploadZone` with drag-and-drop and file picker
2. **Chunked progress** — `UploadProgress` simulates resumable/chunked upload percentages
3. **Validation shell** — placeholder for codec, duration, rights checks
4. **Metadata** — `PublishingShell` (title, description, visibility)
5. **Thumbnail / subtitles** — button shells for future media pipeline
6. **Publish** — final step placeholder

## State

`useUploadStore` tracks `phase`, `files[]`, and `metadata`.

`useCreatorStore` continues the step machine: `upload` → `details` → `publish`.

## Telemetry

`trackUploadFlow(step, properties)` records selection, start, complete, and view events.

## Future integration

TUS client (`tus-js-client`) is listed in studio dependencies for wiring to media-ingest when API contracts are approved.
