# 0015. Mobile: Expo + React Native

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/mobile
- **Tags**: mobile

## Context

We need iOS and Android apps that ship together, share business logic with web, and can drop down to native for the high-performance video pipeline. We need to ship features weekly without app-store review for the JS layer, and we need a path to writing critical paths in native Swift/Kotlin.

## Decision

- **Expo SDK + React Native** is the v1 mobile stack.
- **EAS Build** for CI builds; **EAS Update** for OTA JS deploys (subject to store policy).
- **Native modules** in Swift / Kotlin for the video pipeline (player, recorder, transcoder bridge) and platform integrations (background uploads, push, biometrics).
- Shared code via `packages/ui` (cross-platform primitives) and `packages/api-client`.

## Alternatives considered

- **Native iOS + Native Android (fully separate)** — best in class per-platform; doubles team size and slows shared feature delivery. Reserved for v3 if the surface justifies it.
- **Flutter** — capable; team experience favors React Native, and our design-system investment is in React.
- **Capacitor / Ionic** — too far from native performance for a video-heavy app.

## Consequences

### Positive
- One JS codebase ships features to both platforms simultaneously.
- OTA updates accelerate iteration on non-native bug fixes.
- Native modules where it counts; JS where it doesn't.

### Negative
- React Native + Expo upgrades require coordination; mobile cycles slower than web.
- Performance ceilings exist for the JS bridge; the video / live paths must live in native modules.

## Implementation notes

- React Native New Architecture (Fabric + TurboModules) from day one.
- App Group / shared container for background uploads (`upload-service` client).
- Push tokens registered with `notification-service` on first launch; rotated on identity change.
- A migration path to native (Swift / Kotlin shells around React Native screens) is preserved by keeping screen-level boundaries clean.
