import { create } from 'zustand';

export type PlayerMode = 'mini' | 'theater' | 'live' | 'clip';
export type MediaKind = 'long' | 'short' | 'live' | 'clip';

interface PlayerState {
  readonly mode: PlayerMode;
  readonly mediaKind: MediaKind;
  readonly mediaId: string | null;
  readonly title: string | null;
  readonly playing: boolean;
  readonly fullscreen: boolean;
  readonly controlsVisible: boolean;
  readonly subtitlesOn: boolean;
  readonly currentTimeSec: number;
  readonly setMode: (mode: PlayerMode) => void;
  readonly setMediaKind: (kind: MediaKind) => void;
  readonly setFullscreen: (fullscreen: boolean) => void;
  readonly setControlsVisible: (visible: boolean) => void;
  readonly setCurrentTimeSec: (sec: number) => void;
  readonly togglePlaying: () => void;
  readonly toggleSubtitles: () => void;
  readonly open: (mediaId: string, title: string, mode?: PlayerMode, kind?: MediaKind) => void;
  readonly close: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  mode: 'mini',
  mediaKind: 'long',
  mediaId: null,
  title: null,
  playing: false,
  fullscreen: false,
  controlsVisible: true,
  subtitlesOn: false,
  currentTimeSec: 0,
  setMode: (mode) => set({ mode }),
  setMediaKind: (mediaKind) => set({ mediaKind }),
  setFullscreen: (fullscreen) => set({ fullscreen }),
  setControlsVisible: (controlsVisible) => set({ controlsVisible }),
  setCurrentTimeSec: (currentTimeSec) => set({ currentTimeSec }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  toggleSubtitles: () => set((s) => ({ subtitlesOn: !s.subtitlesOn })),
  open: (mediaId, title, mode = 'theater', mediaKind = 'long') =>
    set({ mediaId, title, mode, mediaKind, playing: true, controlsVisible: true }),
  close: () =>
    set({
      mediaId: null,
      title: null,
      mode: 'mini',
      playing: false,
      fullscreen: false,
      controlsVisible: true,
      subtitlesOn: false,
      currentTimeSec: 0,
    }),
}));
