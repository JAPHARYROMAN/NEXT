import { create } from 'zustand';

interface ModerationPanelState {
  readonly queueOpen: boolean;
  readonly slowMode: boolean;
  readonly flaggedCount: number;
  readonly setQueueOpen: (open: boolean) => void;
  readonly setSlowMode: (enabled: boolean) => void;
  readonly setFlaggedCount: (count: number) => void;
}

export const useModerationPanelStore = create<ModerationPanelState>((set) => ({
  queueOpen: true,
  slowMode: false,
  flaggedCount: 0,
  setQueueOpen: (queueOpen) => set({ queueOpen }),
  setSlowMode: (slowMode) => set({ slowMode }),
  setFlaggedCount: (flaggedCount) => set({ flaggedCount }),
}));
