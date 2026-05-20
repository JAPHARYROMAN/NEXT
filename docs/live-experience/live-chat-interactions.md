# Live Chat & Interactions

## Packages

- `@next/chat-ui` — `LiveChatPanel`, `ChatMessageList`, `InteractionRail`, `QuestionQueue`
- `@next/live-ui` — polls, pinned messages, callouts, moderation banners

## Design

- Efficient list rendering (`memo` rows, capped visible messages)
- Slow-mode indicator — placeholder timing
- Interaction rail: appreciate / poll / ask — not reaction spam
- SR: `role="log"`, `aria-live="polite"` on chat list

## Telemetry

- `trackLiveChatRender(messageCount, durationMs)`

## Placeholders

- No realtime transport — UI contracts only
