import { create } from 'zustand';

export type ControlRoomPanel = 'health' | 'chat' | 'moderation' | 'clips' | 'monetization';

interface ControlRoomLayoutState {
  readonly expandedPanels: readonly ControlRoomPanel[];
  readonly togglePanel: (panel: ControlRoomPanel) => void;
}

export const useControlRoomLayoutStore = create<ControlRoomLayoutState>((set) => ({
  expandedPanels: ['health', 'chat', 'moderation'],
  togglePanel: (panel) =>
    set((s) => {
      const has = s.expandedPanels.includes(panel);
      return {
        expandedPanels: has
          ? s.expandedPanels.filter((p) => p !== panel)
          : [...s.expandedPanels, panel],
      };
    }),
}));
