import { create } from 'zustand';

export type CreatorStep = 'upload' | 'details' | 'publish' | 'live';

interface CreatorState {
  readonly step: CreatorStep;
  readonly draftId: string | null;
  readonly setStep: (step: CreatorStep) => void;
  readonly setDraftId: (id: string | null) => void;
  readonly reset: () => void;
}

export const useCreatorStore = create<CreatorState>((set) => ({
  step: 'upload',
  draftId: null,
  setStep: (step) => set({ step }),
  setDraftId: (draftId) => set({ draftId }),
  reset: () => set({ step: 'upload', draftId: null }),
}));
