import { create } from 'zustand';

export type ConnectionState = 'online' | 'offline' | 'syncing';

export interface OfflineDownload {
  readonly id: string;
  readonly title: string;
  readonly progress: number;
  readonly status: 'queued' | 'downloading' | 'complete';
}

export interface OfflineDraft {
  readonly id: string;
  readonly title: string;
  readonly syncState: 'local' | 'pending' | 'synced';
}

interface OfflineSyncState {
  readonly connection: ConnectionState;
  readonly pendingCount: number;
  readonly downloads: readonly OfflineDownload[];
  readonly drafts: readonly OfflineDraft[];
  readonly setConnection: (connection: ConnectionState) => void;
  readonly setPendingCount: (count: number) => void;
  readonly addDownload: (item: OfflineDownload) => void;
  readonly removeDownload: (id: string) => void;
  readonly setDrafts: (drafts: readonly OfflineDraft[]) => void;
}

export const useOfflineSyncStore = create<OfflineSyncState>((set) => ({
  connection: 'online',
  pendingCount: 0,
  downloads: [],
  drafts: [],
  setConnection: (connection) => set({ connection }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  addDownload: (item) =>
    set((s) => ({ downloads: [...s.downloads, item], pendingCount: s.pendingCount + 1 })),
  removeDownload: (id) =>
    set((s) => ({
      downloads: s.downloads.filter((d) => d.id !== id),
      pendingCount: Math.max(0, s.pendingCount - 1),
    })),
  setDrafts: (drafts) => set({ drafts }),
}));
