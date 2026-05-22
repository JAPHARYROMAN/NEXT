import { create } from 'zustand';

export type StudioPanel = 'overview' | 'audience' | 'publishing' | 'realtime';

interface StudioWorkspaceState {
  readonly activePanel: StudioPanel;
  readonly pinnedWidgets: readonly string[];
  readonly setActivePanel: (panel: StudioPanel) => void;
  readonly toggleWidgetPin: (id: string) => void;
}

export const useStudioWorkspaceStore = create<StudioWorkspaceState>((set) => ({
  activePanel: 'overview',
  pinnedWidgets: [],
  setActivePanel: (activePanel) => set({ activePanel }),
  toggleWidgetPin: (id) =>
    set((s) => ({
      pinnedWidgets: s.pinnedWidgets.includes(id)
        ? s.pinnedWidgets.filter((w) => w !== id)
        : [...s.pinnedWidgets, id],
    })),
}));
