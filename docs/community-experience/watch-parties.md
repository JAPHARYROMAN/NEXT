# Watch parties

Watch parties provide sync viewing shells with group presence and post-watch discussion transitions.

## Routes

- `/watch-party` — lobby listing demo parties
- `/watch-party/[id]` — room experience

## Layout

`WatchPartyLayout` (layout-engine) splits viewport and social column: stacked on mobile, 70/30 on desktop.

## Components

`WatchPartyRoom` (`@next/social-ui`) includes:

- Host controls (when `useWatchPartyStore.isHost`)
- Participant presence via `MemberPresence`
- Group composer
- Phase: `sync` | `watching` | `discussion`

## State

`useWatchPartyStore` tracks `partyId`, `phase`, `syncOffsetMs`, and host flag. Join telemetry via `trackWatchPartyJoin`.

## Placeholders

Player sync, shared queue persistence, and realtime chat transport are not wired — UI contracts only.
