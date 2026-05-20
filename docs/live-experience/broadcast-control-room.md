# Broadcast Control Room

## Routes (Studio)

- `/live` — hub
- `/live/control-room` — mission-control dashboard
- `/live/setup` — stream setup & preflight
- `/live/events` — scheduled events list

## Composition

- `ControlRoomLayout` — preview + health/chat/moderation/clips/monetization
- `@next/broadcast-ui` — dashboard, health metrics, clips, checklist
- `@next/moderation-ui` — review queue (frontend only)
- `@next/chat-ui` — creator-side chat panel

## State

- `useLiveSessionStore` — phase, health, viewers
- `useControlRoomLayoutStore` — panel expansion
- Telemetry: `trackControlRoomLatency`, `trackStreamHealthPanel`

## Placeholders

- Ingest/encoder, real moderation engine, payments
