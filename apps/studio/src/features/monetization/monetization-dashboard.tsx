'use client';

import { MonetizationOverview, StudioPageHeader } from '@next/studio-components';
import { MembershipTierCard, TierComparisonTable } from '@next/subscription-ui';
import { RevenueSourceBreakdown } from '@next/revenue-ui';
import { Surface } from '@next/ui';
import { demoRevenueSources } from '@/lib/demo-revenue';

const studioMembershipTiers = [
  {
    id: 'supporter',
    name: 'Supporter',
    priceLabel: '$5',
    interval: 'month' as const,
    description: 'Steady support',
    benefits: ['Member posts', 'Early access'],
  },
  {
    id: 'patron',
    name: 'Patron',
    priceLabel: '$12',
    interval: 'month' as const,
    description: 'Deeper access',
    benefits: ['Live Q&A', 'Download packs'],
    highlighted: true,
  },
];

export function MonetizationDashboard() {
  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Monetization"
        subtitle="Revenue, memberships, sponsorship, commerce — empowering not extractive."
      />
      <MonetizationOverview />
      <RevenueSourceBreakdown sources={demoRevenueSources} />
      <div>
        <h3 className="mb-4 text-sm font-medium text-fg">Membership tiers</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {studioMembershipTiers.map((tier) => (
            <MembershipTierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
      <Surface bordered className="p-5">
        <h3 className="text-sm font-medium text-fg">Tier comparison</h3>
        <TierComparisonTable tiers={studioMembershipTiers} className="mt-4" />
      </Surface>
    </div>
  );
}
