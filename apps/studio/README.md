# @next/studio

Creator workstation: upload, edit, schedule, monetize, analyze.

## Architecture
- **Framework**: Next.js 15. Mostly client-rendered: this is a heavily interactive app, not content browsing.
- **State**: Zustand stores per workspace; TanStack Query for cloud sync; IndexedDB (via idb-keyval) for offline draft + upload resume state.
- **Upload**: Resumable uploads via [`tus-js-client`](https://github.com/tus/tus-js-client) against `upload-service`.
- **Editing**: timeline editor uses Web Audio + Canvas/WebGL; future migration to native compositor in a Tauri shell tracked under [ADR future].
- **Auth**: same OIDC as web, with additional creator scopes (`creator:write`, `payment:read`).

## Performance
- Splits per workspace tab; lazy-load heavy editor surfaces.
- Web Workers for video frame extraction + waveform rendering.
- Resumable uploads survive page refresh.
