import { create } from 'zustand';

export type PlayerMode = 'mini' | 'theater' | 'live' | 'clip';

interface PlayerState {
  readonly mode: PlayerMode;
  readonly mediaId: string | null;
  readonly title: string | null;
  readonly setMode: (mode: PlayerMode) => void;
  readonly open: (mediaId: string, title: string, mode?: PlayerMode) => void;
  readonly close: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  mode: 'mini',
  mediaId: null,
  title: null,
  setMode: (mode) => set({ mode }),
  open: (mediaId, title, mode = 'theater') => set({ mediaId, title, mode }),
  close: () => set({ mediaId: null, title: null, mode: 'mini' }),
}));
