# Stream Setup

## Surface

Studio `/live/setup` — `StreamSetupExperience`

## Flow

1. Event details (`StreamSetupForm`) — title, description, visibility, schedule
2. `PreflightChecklist` — readiness items
3. `IngestPlaceholders` — stream key / server (mock)
4. `GoLiveConfirmation` — non-stressful confirm

## State

- `useStreamSetupStore` — draft fields, readiness
- `trackLiveGoLiveFriction` on edits and confirm/cancel

## Principles

- Clear readiness states — no panic UI
- Poster/thumbnail upload is a contract placeholder
