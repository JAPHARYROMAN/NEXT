import { create } from 'zustand';

export type ImmersiveMode = 'standard' | 'ambient' | 'spatial' | 'theater';

interface ImmersiveState {
  readonly mode: ImmersiveMode;
  readonly activeDepthLayer: number;
  readonly lowDistraction: boolean;
  readonly reducedMotionImmersive: boolean;
  readonly setMode: (mode: ImmersiveMode) => void;
  readonly setDepthLayer: (layer: number) => void;
  readonly setLowDistraction: (on: boolean) => void;
  readonly setReducedMotionImmersive: (on: boolean) => void;
}

export const useImmersiveStore = create<ImmersiveState>((set) => ({
  mode: 'standard',
  activeDepthLayer: 0,
  lowDistraction: false,
  reducedMotionImmersive: false,
  setMode: (mode) => set({ mode }),
  setDepthLayer: (activeDepthLayer) => set({ activeDepthLayer }),
  setLowDistraction: (lowDistraction) => set({ lowDistraction }),
  setReducedMotionImmersive: (reducedMotionImmersive) => set({ reducedMotionImmersive }),
}));
