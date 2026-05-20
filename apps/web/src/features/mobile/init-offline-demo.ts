import { useOfflineSyncStore } from '@next/frontend-utils';

export function initOfflineDemo(): void {
  const state = useOfflineSyncStore.getState();
  if (state.downloads.length) return;
  useOfflineSyncStore.setState({
    downloads: [
      { id: 'd1', title: 'Ambient drift', progress: 100, status: 'complete' },
      { id: 'd2', title: 'Live ritual recap', progress: 45, status: 'downloading' },
    ],
    drafts: [{ id: 'u1', title: 'Field notes ep.2', syncState: 'pending' }],
    pendingCount: 1,
  });
}
