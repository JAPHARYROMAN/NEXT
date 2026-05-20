import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PersonalizationLevel = 'minimal' | 'balanced' | 'rich';

interface PreferencesState {
  readonly feedPersonalization: number;
  readonly discoveryRandomness: number;
  readonly language: string;
  readonly creatorDiscovery: boolean;
  readonly communityDiscovery: boolean;
  readonly sensitiveContentFilter: boolean;
  readonly personalizationLevel: PersonalizationLevel;
  readonly setFeedPersonalization: (v: number) => void;
  readonly setDiscoveryRandomness: (v: number) => void;
  readonly setLanguage: (v: string) => void;
  readonly setCreatorDiscovery: (v: boolean) => void;
  readonly setCommunityDiscovery: (v: boolean) => void;
  readonly setSensitiveContentFilter: (v: boolean) => void;
  readonly setPersonalizationLevel: (v: PersonalizationLevel) => void;
  readonly resetRecommendations: () => void;
  readonly reset: () => void;
}

const initial = {
  feedPersonalization: 60,
  discoveryRandomness: 35,
  language: 'en',
  creatorDiscovery: true,
  communityDiscovery: true,
  sensitiveContentFilter: true,
  personalizationLevel: 'balanced' as PersonalizationLevel,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initial,
      setFeedPersonalization: (feedPersonalization) => set({ feedPersonalization }),
      setDiscoveryRandomness: (discoveryRandomness) => set({ discoveryRandomness }),
      setLanguage: (language) => set({ language }),
      setCreatorDiscovery: (creatorDiscovery) => set({ creatorDiscovery }),
      setCommunityDiscovery: (communityDiscovery) => set({ communityDiscovery }),
      setSensitiveContentFilter: (sensitiveContentFilter) => set({ sensitiveContentFilter }),
      setPersonalizationLevel: (personalizationLevel) => set({ personalizationLevel }),
      resetRecommendations: () =>
        set({
          feedPersonalization: 50,
          discoveryRandomness: 30,
          personalizationLevel: 'balanced',
        }),
      reset: () => set(initial),
    }),
    { name: 'next-preferences-v1' },
  ),
);
