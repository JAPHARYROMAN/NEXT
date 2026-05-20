'use client';

import { Surface } from '@next/ui';
import type { SponsorshipProposal } from './types';

export interface ProposalReviewPanelProps {
  readonly proposal: SponsorshipProposal;
  readonly onAccept?: () => void;
  readonly onDecline?: () => void;
}

export function ProposalReviewPanel({ proposal, onAccept, onDecline }: ProposalReviewPanelProps) {
  return (
    <Surface bordered className="p-5" aria-label="Proposal review">
      <h3 className="text-sm font-medium text-fg">{proposal.campaignTitle}</h3>
      <p className="mt-1 text-xs text-muted">@{proposal.creatorHandle}</p>
      <p className="mt-3 text-sm text-muted">{proposal.termsSummary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-fg"
        >
          Accept terms
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="rounded-lg border border-subtle/20 px-3 py-2 text-sm"
        >
          Decline
        </button>
      </div>
    </Surface>
  );
}
