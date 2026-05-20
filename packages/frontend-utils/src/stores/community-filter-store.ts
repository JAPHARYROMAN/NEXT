import { create } from 'zustand';

export type CommunityFilter = 'all' | 'joined' | 'emerging' | 'underground';

interface CommunityFilterState {
  readonly filter: CommunityFilter;
  readonly setFilter: (filter: CommunityFilter) => void;
}

export const useCommunityFilterStore = create<CommunityFilterState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));
