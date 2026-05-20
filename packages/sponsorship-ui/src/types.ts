export type SponsorshipStatus =
  | 'draft'
  | 'proposed'
  | 'accepted'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'declined';

export interface SponsorshipOpportunity {
  readonly id: string;
  readonly brand: string;
  readonly title: string;
  readonly budgetLabel: string;
  readonly deliverables: readonly string[];
  readonly status: SponsorshipStatus;
  readonly payoutEstimate?: string;
  readonly deadline?: string;
}

export interface SponsorshipProposal {
  readonly id: string;
  readonly creatorHandle: string;
  readonly campaignTitle: string;
  readonly termsSummary: string;
  readonly status: SponsorshipStatus;
}
