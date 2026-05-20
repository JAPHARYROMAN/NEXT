'use client';

import { Surface } from '@next/ui';

export interface SponsorCampaignShellProps {
  readonly campaignName: string;
  readonly budgetLabel: string;
  readonly creatorsMatched: number;
  readonly performanceLabel?: string;
}

export function SponsorCampaignShell({
  campaignName,
  budgetLabel,
  creatorsMatched,
  performanceLabel,
}: SponsorCampaignShellProps) {
  return (
    <Surface bordered className="p-5" aria-label="Campaign overview">
      <h3 className="text-sm font-medium text-fg">{campaignName}</h3>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Budget</dt>
          <dd className="text-fg">{budgetLabel}</dd>
        </div>
        <div>
          <dt className="text-muted">Creators matched</dt>
          <dd className="text-fg">{creatorsMatched}</dd>
        </div>
        {performanceLabel ? (
          <div>
            <dt className="text-muted">Performance</dt>
            <dd className="text-fg">{performanceLabel}</dd>
          </div>
        ) : null}
      </dl>
    </Surface>
  );
}
