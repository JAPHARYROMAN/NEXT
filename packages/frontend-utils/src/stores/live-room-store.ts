import { create } from 'zustand';

export type LiveRoomLayout = 'theater' | 'split' | 'compact';

interface LiveRoomState {
  readonly layout: LiveRoomLayout;
  readonly chatCollapsed: boolean;
  readonly showReplay: boolean;
  readonly setLayout: (layout: LiveRoomLayout) => void;
  readonly setChatCollapsed: (collapsed: boolean) => void;
  readonly setShowReplay: (show: boolean) => void;
}

export const useLiveRoomStore = create<LiveRoomState>((set) => ({
  layout: 'split',
  chatCollapsed: false,
  showReplay: false,
  setLayout: (layout) => set({ layout }),
  setChatCollapsed: (chatCollapsed) => set({ chatCollapsed }),
  setShowReplay: (showReplay) => set({ showReplay }),
}));
