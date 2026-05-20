import { create } from 'zustand';

export type MobileNavState = 'standard' | 'fullscreen' | 'hidden';

interface MobileNavigationState {
  readonly state: MobileNavState;
  readonly activeTab: string | null;
  readonly gestureNavEnabled: boolean;
  readonly setState: (state: MobileNavState) => void;
  readonly setActiveTab: (tab: string | null) => void;
  readonly setGestureNavEnabled: (enabled: boolean) => void;
}

export const useMobileNavigationStore = create<MobileNavigationState>((set) => ({
  state: 'standard',
  activeTab: null,
  gestureNavEnabled: true,
  setState: (state) => set({ state }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setGestureNavEnabled: (gestureNavEnabled) => set({ gestureNavEnabled }),
}));
