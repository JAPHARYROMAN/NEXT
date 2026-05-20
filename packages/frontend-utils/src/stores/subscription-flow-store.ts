import { create } from 'zustand';

export type SubscriptionStep = 'browse' | 'compare' | 'confirm' | 'billing' | 'complete';

interface SubscriptionFlowState {
  readonly step: SubscriptionStep;
  readonly selectedTierId: string | null;
  readonly setStep: (step: SubscriptionStep) => void;
  readonly selectTier: (tierId: string) => void;
  readonly reset: () => void;
}

export const useSubscriptionFlowStore = create<SubscriptionFlowState>((set) => ({
  step: 'browse',
  selectedTierId: null,
  setStep: (step) => set({ step }),
  selectTier: (selectedTierId) => set({ selectedTierId, step: 'confirm' }),
  reset: () => set({ step: 'browse', selectedTierId: null }),
}));
