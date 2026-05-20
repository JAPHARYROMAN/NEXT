import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchIntent =
  | 'exact'
  | 'explore'
  | 'chaos'
  | 'learn'
  | 'creators'
  | 'communities'
  | 'live';

export type DiscoveryMode = 'precision' | 'expansion' | 'chaos';
export type ResultLayout = 'mixed' | 'grouped' | 'compact' | 'immersive';

export interface SearchFilters {
  readonly duration?: 'short' | 'medium' | 'long';
  readonly recency?: 'day' | 'week' | 'month' | 'any';
  readonly mood?: 'calm' | 'energetic' | 'experimental';
}

export interface TopicPortal {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

interface SearchDiscoveryState {
  query: string;
  intent: SearchIntent;
  discoveryMode: DiscoveryMode;
  chaosMode: boolean;
  resultLayout: ResultLayout;
  filters: SearchFilters;
  refinementIds: string[];
  recentSearches: string[];
  savedSearches: string[];
  topicPortals: TopicPortal[];
  setQuery: (query: string) => void;
  setIntent: (intent: SearchIntent) => void;
  setDiscoveryMode: (mode: DiscoveryMode) => void;
  setChaosMode: (enabled: boolean) => void;
  setResultLayout: (layout: ResultLayout) => void;
  setFilters: (filters: SearchFilters) => void;
  toggleRefinement: (id: string) => void;
  addRecentSearch: (query: string) => void;
  saveSearch: (query: string) => void;
  setTopicPortals: (portals: TopicPortal[]) => void;
  toSearchParams: () => URLSearchParams;
  hydrateFromParams: (params: URLSearchParams) => void;
}

const MAX_RECENT = 8;

export const useSearchDiscoveryStore = create<SearchDiscoveryState>()(
  persist(
    (set, get) => ({
      query: '',
      intent: 'explore',
      discoveryMode: 'expansion',
      chaosMode: false,
      resultLayout: 'mixed',
      filters: {},
      refinementIds: [],
      recentSearches: [],
      savedSearches: [],
      topicPortals: [],

      setQuery: (query) => set({ query }),
      setIntent: (intent) => set({ intent }),
      setDiscoveryMode: (discoveryMode) => set({ discoveryMode }),
      setChaosMode: (chaosMode) => set({ chaosMode }),
      setResultLayout: (resultLayout) => set({ resultLayout }),
      setFilters: (filters) => set({ filters }),
      toggleRefinement: (id) =>
        set((s) => ({
          refinementIds: s.refinementIds.includes(id)
            ? s.refinementIds.filter((x) => x !== id)
            : [...s.refinementIds, id],
        })),
      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((s) => ({
          recentSearches: [trimmed, ...s.recentSearches.filter((q) => q !== trimmed)].slice(
            0,
            MAX_RECENT,
          ),
        }));
      },
      saveSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((s) => ({
          savedSearches: s.savedSearches.includes(trimmed)
            ? s.savedSearches
            : [...s.savedSearches, trimmed],
        }));
      },
      setTopicPortals: (topicPortals) => set({ topicPortals }),

      toSearchParams: () => {
        const s = get();
        const params = new URLSearchParams();
        if (s.query) params.set('q', s.query);
        if (s.intent !== 'explore') params.set('intent', s.intent);
        if (s.discoveryMode !== 'expansion') params.set('mode', s.discoveryMode);
        if (s.chaosMode) params.set('chaos', '1');
        if (s.resultLayout !== 'mixed') params.set('layout', s.resultLayout);
        if (s.refinementIds.length) params.set('refine', s.refinementIds.join(','));
        return params;
      },

      hydrateFromParams: (params) => {
        const intent = params.get('intent') as SearchIntent | null;
        const mode = params.get('mode') as DiscoveryMode | null;
        const layout = params.get('layout') as ResultLayout | null;
        const refine = params.get('refine');
        set({
          query: params.get('q') ?? '',
          ...(intent ? { intent } : {}),
          ...(mode ? { discoveryMode: mode } : {}),
          chaosMode: params.get('chaos') === '1',
          ...(layout ? { resultLayout: layout } : {}),
          refinementIds: refine ? refine.split(',').filter(Boolean) : [],
        });
      },
    }),
    {
      name: 'next-search-discovery',
      partialize: (s) => ({
        recentSearches: s.recentSearches,
        savedSearches: s.savedSearches,
        intent: s.intent,
        resultLayout: s.resultLayout,
      }),
    },
  ),
);
