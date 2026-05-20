import { create } from 'zustand';

export type SponsorshipWorkflowStep =
  | 'discover'
  | 'proposal'
  | 'deliverables'
  | 'review'
  | 'complete';

interface SponsorshipWorkflowState {
  readonly step: SponsorshipWorkflowStep;
  readonly activeOpportunityId: string | null;
  readonly setStep: (step: SponsorshipWorkflowStep) => void;
  readonly setOpportunity: (id: string) => void;
  readonly reset: () => void;
}

export const useSponsorshipWorkflowStore = create<SponsorshipWorkflowState>((set) => ({
  step: 'discover',
  activeOpportunityId: null,
  setStep: (step) => set({ step }),
  setOpportunity: (activeOpportunityId) => set({ activeOpportunityId, step: 'proposal' }),
  reset: () => set({ step: 'discover', activeOpportunityId: null }),
}));
