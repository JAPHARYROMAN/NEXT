# Mobile Experience Architecture

Phase 19 delivers a **mobile-first adaptive layer** for NEXT — touch-native, cinematic, and cross-device aware.

## Strategy

| Surface                      | Role                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| `apps/web/src/app/mobile/*`  | Primary Phase 19 deliverable — adaptive web-mobile routes   |
| `packages/mobile-ui`         | Composed mobile surfaces (feed, player, community, creator) |
| `packages/navigation-ui`     | Adaptive bottom nav, contextual bars, floating surfaces     |
| `packages/gesture-system`    | Swipe, long-press, intentional touch handlers               |
| `packages/adaptive-layouts`  | Mobile shell, immersive viewport, density                   |
| `packages/responsive-engine` | Device class, orientation, viewport signals                 |
| `packages/offline-ui`        | Offline banner, downloads, drafts, sync indicator           |
| `apps/mobile`                | Expo / React Native scaffold — future native parity         |

React Native exists (`apps/mobile`) but Phase 19 ships the **web-mobile adaptive layer** first, aligned with the constitution’s “React Native initially” path for native modules later.

## State

- `useMobileNavigationStore` — nav visibility (standard / fullscreen / hidden)
- `useContinuityStore` — resume sessions, handoff targets, synced preferences
- `useOfflineSyncStore` — connection, downloads, drafts
- `useGestureStore` — active gesture for scrub/swipe feedback

## Telemetry

`gesture_latency`, `mobile_nav_timing`, `mobile_render_perf`, `offline_friction`, `playback_responsiveness`, `continuity_handoff`.

## Testing

Vitest + jsdom viewport mocks in package and `apps/web/src/features/mobile/mobile.test.tsx`.

Dev: `pnpm --filter @next/web dev` → `http://localhost:3000/mobile` (use responsive devtools or a real device).
