'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { SponsorshipOpportunity } from './types';

const statusTone: Record<SponsorshipOpportunity['status'], string> = {
  draft: 'text-muted',
  proposed: 'text-sky-300',
  accepted: 'text-emerald-300',
  in_progress: 'text-accent',
  review: 'text-amber-300',
  completed: 'text-emerald-300',
  declined: 'text-red-300',
};

export interface CreatorOpportunityCardProps {
  readonly opportunity: SponsorshipOpportunity;
  readonly onOpen?: (id: string) => void;
}

export function CreatorOpportunityCard({ opportunity, onOpen }: CreatorOpportunityCardProps) {
  return (
    <Surface bordered className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted">{opportunity.brand}</p>
          <h3 className="text-sm font-medium text-fg">{opportunity.title}</h3>
        </div>
        <span className={clsx('text-xs font-medium capitalize', statusTone[opportunity.status])}>
          {opportunity.status.replace('_', ' ')}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">Budget {opportunity.budgetLabel}</p>
      {opportunity.payoutEstimate ? (
        <p className="mt-1 text-xs text-muted">Est. payout {opportunity.payoutEstimate}</p>
      ) : null}
      <ul className="mt-3 space-y-1 text-xs text-fg" aria-label="Deliverables">
        {opportunity.deliverables.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onOpen?.(opportunity.id)}
        className="mt-4 text-sm text-accent hover:underline"
      >
        Review proposal
      </button>
    </Surface>
  );
}
