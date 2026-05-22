# Offline Experience

`@next/offline-ui` surfaces connectivity-aware UX without backend coupling (Phase 19 frontend-only).

## Components

- **SyncIndicator** — online / syncing / offline pill
- **OfflineBanner** — alert when offline; friction telemetry
- **DownloadManager** — queue UI backed by `useOfflineSyncStore.downloads`
- **OfflineDraftShell** — creator drafts with sync state labels

## Store

`useOfflineSyncStore` holds `connection`, `pendingCount`, `downloads`, `drafts`. Demo data seeded on `/mobile/offline`.

## Degradation

Graceful copy and local-only actions; no failed network spam. Real sync pipelines are future backend work.
