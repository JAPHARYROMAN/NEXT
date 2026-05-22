import { create } from 'zustand';

export type EnvironmentMood = 'calm' | 'energetic' | 'focused' | 'social';

interface EnvironmentState {
  readonly mood: EnvironmentMood;
  readonly overlayVisible: boolean;
  readonly ambientPlaybackId: string | null;
  readonly setMood: (mood: EnvironmentMood) => void;
  readonly setOverlayVisible: (visible: boolean) => void;
  readonly setAmbientPlaybackId: (id: string | null) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  mood: 'calm',
  overlayVisible: false,
  ambientPlaybackId: null,
  setMood: (mood) => set({ mood }),
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  setAmbientPlaybackId: (ambientPlaybackId) => set({ ambientPlaybackId }),
}));
