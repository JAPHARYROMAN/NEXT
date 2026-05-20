import { create } from 'zustand';

export type AnalyticsRange = '7d' | '28d' | '90d' | '365d';
export type AnalyticsSurface =
  | 'engagement'
  | 'audience'
  | 'retention'
  | 'discovery'
  | 'recommendation';

interface AnalyticsFilterState {
  readonly range: AnalyticsRange;
  readonly surface: AnalyticsSurface;
  readonly comparePrevious: boolean;
  readonly setRange: (range: AnalyticsRange) => void;
  readonly setSurface: (surface: AnalyticsSurface) => void;
  readonly setComparePrevious: (compare: boolean) => void;
}

export const useAnalyticsFilterStore = create<AnalyticsFilterState>((set) => ({
  range: '28d',
  surface: 'engagement',
  comparePrevious: true,
  setRange: (range) => set({ range }),
  setSurface: (surface) => set({ surface }),
  setComparePrevious: (comparePrevious) => set({ comparePrevious }),
}));
