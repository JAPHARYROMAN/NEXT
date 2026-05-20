# Cross-Device Continuity

## Store (`useContinuityStore`)

- `resume` — `{ mediaId, title, positionSec, updatedAt }`
- `lastDevice` — `phone` | `tablet` | `desktop` | `tv` | `unknown`
- `handoffTarget` — requested destination device class
- `syncedPreferences` — key/value preference shell (demo)

## UI

- `HandoffCard` (`@next/mobile-ui`) on hub and `/mobile/continuity`
- Hand off buttons request `handoffTarget`; `trackContinuityHandoff` on confirm

## Creator continuity

Mobile creator dashboard links to `/studio/upload`; offline drafts show pending sync state.

Native handoff (AirPlay, OS continuity) is out of scope for Phase 19 — UI shells only.
