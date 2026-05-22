import { create } from 'zustand';

export type ActiveGesture = 'none' | 'swipe' | 'scrub' | 'edge' | 'long_press';

interface GestureState {
  readonly active: ActiveGesture;
  readonly edgeSwipeEnabled: boolean;
  readonly setActive: (gesture: ActiveGesture) => void;
  readonly setEdgeSwipeEnabled: (enabled: boolean) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  active: 'none',
  edgeSwipeEnabled: true,
  setActive: (active) => set({ active }),
  setEdgeSwipeEnabled: (edgeSwipeEnabled) => set({ edgeSwipeEnabled }),
}));
