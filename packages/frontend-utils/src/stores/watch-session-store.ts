import { create } from 'zustand';

export type WatchPanel = 'metadata' | 'chapters' | 'related' | 'discussion';

interface WatchSessionState {
  readonly mediaId: string | null;
  readonly panel: WatchPanel;
  readonly discussionOpen: boolean;
  readonly theater: boolean;
  readonly setMedia: (mediaId: string) => void;
  readonly setPanel: (panel: WatchPanel) => void;
  readonly toggleDiscussion: () => void;
  readonly setTheater: (theater: boolean) => void;
  readonly reset: () => void;
}

export const useWatchSessionStore = create<WatchSessionState>((set) => ({
  mediaId: null,
  panel: 'metadata',
  discussionOpen: false,
  theater: true,
  setMedia: (mediaId) => set({ mediaId }),
  setPanel: (panel) => set({ panel }),
  toggleDiscussion: () => set((s) => ({ discussionOpen: !s.discussionOpen })),
  setTheater: (theater) => set({ theater }),
  reset: () => set({ mediaId: null, panel: 'metadata', discussionOpen: false, theater: true }),
}));
