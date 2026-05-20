import { create } from 'zustand';

export type TvPlaybackOverlay = 'none' | 'metadata' | 'chapters' | 'social' | 'subtitles';

interface TvSessionState {
  readonly continueWatchingId: string | null;
  readonly shelfScrollOffsets: Record<string, number>;
  readonly playbackOverlay: TvPlaybackOverlay;
  readonly watchPartyPresence: number;
  readonly liveEventId: string | null;
  readonly reducedTvMotion: boolean;
  readonly setContinueWatching: (id: string | null) => void;
  readonly setShelfScroll: (shelf: string, offset: number) => void;
  readonly setPlaybackOverlay: (overlay: TvPlaybackOverlay) => void;
  readonly setWatchPartyPresence: (count: number) => void;
  readonly setLiveEventId: (id: string | null) => void;
  readonly setReducedTvMotion: (reduced: boolean) => void;
}

export const useTvSessionStore = create<TvSessionState>((set) => ({
  continueWatchingId: null,
  shelfScrollOffsets: {},
  playbackOverlay: 'none',
  watchPartyPresence: 0,
  liveEventId: null,
  reducedTvMotion: false,
  setContinueWatching: (continueWatchingId) => set({ continueWatchingId }),
  setShelfScroll: (shelf, offset) =>
    set((s) => ({
      shelfScrollOffsets: { ...s.shelfScrollOffsets, [shelf]: offset },
    })),
  setPlaybackOverlay: (playbackOverlay) => set({ playbackOverlay }),
  setWatchPartyPresence: (watchPartyPresence) => set({ watchPartyPresence }),
  setLiveEventId: (liveEventId) => set({ liveEventId }),
  setReducedTvMotion: (reducedTvMotion) => set({ reducedTvMotion }),
}));
