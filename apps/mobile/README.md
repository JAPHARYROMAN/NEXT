# @next/mobile

iOS + Android. Expo SDK 52 + React Native 0.76 + New Architecture.

## Architecture

- **Navigation**: Expo Router (file-system routes).
- **State**: TanStack Query for server data; Zustand for client UI; MMKV for persistent local storage.
- **Auth**: native sign-in via ASWebAuthenticationSession (iOS) / Chrome Custom Tabs (Android). Tokens in Keychain / Keystore via Expo SecureStore.
- **Media**: native modules in Swift/Kotlin for player, recorder, and background uploads.
- **Distribution**: EAS Build for binaries; EAS Update for OTA JS updates (within store policy).

## Phase 19 (web-mobile layer)

Adaptive touch UX ships first at `apps/web/src/app/mobile` and `packages/mobile-ui`. Open http://localhost:3000/mobile after `pnpm --filter @next/web dev`. Native tabs: `(tabs)/index`, `(tabs)/feed`.

## Run

```bash
pnpm --filter @next/mobile start
```

Then press `i` (iOS sim) or `a` (Android emulator).

## CI builds

```bash
pnpm --filter @next/mobile build:ios
pnpm --filter @next/mobile build:android
```
