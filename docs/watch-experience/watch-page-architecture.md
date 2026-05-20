# Watch Page Architecture

## Overview

The immersive watch experience composes `@next/player-ui`, `@next/media-ui`, `@next/layout-engine`, and `@next/interaction-ui` in `apps/web` via `ImmersiveWatch`.

## Layout

- **MediaViewport** — responsive max-width from breakpoint (`sm` → `ultrawide`).
- **WatchLayout** — player stack + metadata; optional **SplitView** when discussion is open.
- **Aside rail** — contextual recommendation placeholders (no backend ranking).

## State

| Store                  | Responsibility                                       |
| ---------------------- | ---------------------------------------------------- |
| `usePlayerStore`       | Mode, playback UI, fullscreen, subtitles             |
| `useWatchSessionStore` | Panel (metadata/chapters/related), discussion toggle |

## Routes

- `/watch/[id]` — primary immersive watch surface

## Placeholders

- Video surface is a gradient preview until the media pipeline connects.
- Chapters and related items use `demo-watch` fixtures.
