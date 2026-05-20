import { create } from 'zustand';

export type RevenueRange = '7d' | '28d' | '90d' | '365d';
export type RevenueFilterSource =
  | 'all'
  | 'subscriptions'
  | 'tips'
  | 'premium'
  | 'sponsorship'
  | 'commerce';

interface RevenueFilterState {
  readonly range: RevenueRange;
  readonly source: RevenueFilterSource;
  readonly setRange: (range: RevenueRange) => void;
  readonly setSource: (source: RevenueFilterSource) => void;
}

export const useRevenueFilterStore = create<RevenueFilterState>((set) => ({
  range: '28d',
  source: 'all',
  setRange: (range) => set({ range }),
  setSource: (source) => set({ source }),
}));
