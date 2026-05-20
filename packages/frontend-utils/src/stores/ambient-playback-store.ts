import { create } from 'zustand';

export type AtmosphereIntensity = 'subtle' | 'medium';

interface AmbientPlaybackState {
  readonly playing: boolean;
  readonly atmosphereIntensity: AtmosphereIntensity;
  readonly mediaId: string | null;
  readonly setPlaying: (playing: boolean) => void;
  readonly setAtmosphereIntensity: (intensity: AtmosphereIntensity) => void;
  readonly setMediaId: (id: string | null) => void;
}

export const useAmbientPlaybackStore = create<AmbientPlaybackState>((set) => ({
  playing: false,
  atmosphereIntensity: 'subtle',
  mediaId: null,
  setPlaying: (playing) => set({ playing }),
  setAtmosphereIntensity: (atmosphereIntensity) => set({ atmosphereIntensity }),
  setMediaId: (mediaId) => set({ mediaId }),
}));
