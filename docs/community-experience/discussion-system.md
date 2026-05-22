# Discussion system

Discussions are implemented in `@next/social-ui` and re-exported from `@next/interaction-ui` for watch/live surfaces.

## Components

- `DiscussionThread` — threaded comments with optional quote and media reply flags
- `ThreadComposer` — draft + quote preview via `useDiscussionComposerStore`
- `ReactionBar` — calm symbol reactions with `trackReactionPerf`
- `ModerationNotice` — non-ranked, transparency-first copy

## State

`useDiscussionComposerStore` holds draft text and quote preview. Submission tracks `trackDiscussionLatency`.

## Accessibility

- Thread lists use semantic `ol` / `li`
- Composer labels are screen-reader visible
- Reactions expose `aria-label` per symbol and `aria-live` for send feedback
- Reduced motion respected via `motionSafe` + `useReducedMotion`

## API placeholder

Comment ordering is insertion-order (warm chronological). Backend ranking hooks are intentionally omitted.
