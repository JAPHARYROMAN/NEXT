import { create } from 'zustand';

interface FocusLayoutState {
  readonly focusRegionId: string;
  readonly adaptiveDensity: 'compact' | 'comfortable' | 'spacious';
  readonly setFocusRegion: (id: string) => void;
  readonly setAdaptiveDensity: (density: FocusLayoutState['adaptiveDensity']) => void;
}

export const useFocusLayoutStore = create<FocusLayoutState>((set) => ({
  focusRegionId: 'global',
  adaptiveDensity: 'comfortable',
  setFocusRegion: (focusRegionId) => set({ focusRegionId }),
  setAdaptiveDensity: (adaptiveDensity) => set({ adaptiveDensity }),
}));
