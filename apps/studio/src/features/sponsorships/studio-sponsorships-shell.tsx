'use client';

import {
  CreatorOpportunityCard,
  DeliverablesChecklist,
  SponsorshipDisclosureBanner,
} from '@next/sponsorship-ui';
import { StudioPageHeader } from '@next/studio-components';
import { Surface } from '@next/ui';

const opportunities = [
  {
    id: 'sp1',
    brand: 'Quiet Audio',
    title: 'Spring headphone launch',
    budgetLabel: '$2,500',
    deliverables: ['60s integration', 'Community post'],
    status: 'proposed' as const,
    payoutEstimate: '$2,100',
  },
];

export function StudioSponsorshipsShell() {
  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Sponsorships"
        subtitle="Review opportunities, track deliverables, disclose clearly."
      />
      <SponsorshipDisclosureBanner brand="Quiet Audio" />
      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <CreatorOpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
      <DeliverablesChecklist
        items={[
          { id: 'd1', label: 'Draft script', completed: true },
          { id: 'd2', label: 'Record integration', completed: false },
        ]}
      />
      <Surface bordered className="p-5">
        <p className="text-sm text-muted">Escrow and campaign management — backend pending.</p>
      </Surface>
    </div>
  );
}
