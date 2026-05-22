import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembershipTierCard } from './membership-tier-card';
import { TierComparisonTable } from './tier-comparison-table';
import { BillingStatusPanel } from './billing-status-panel';

const demoTier = {
  id: 'supporter',
  name: 'Supporter',
  priceLabel: '$5',
  interval: 'month' as const,
  description: 'Support the work',
  benefits: ['Early access', 'Member posts'],
};

describe('subscription-ui', () => {
  it('renders tier card with benefits', () => {
    render(<MembershipTierCard tier={demoTier} />);
    expect(screen.getByText('Supporter')).toBeTruthy();
    expect(screen.getByLabelText('Supporter benefits')).toBeTruthy();
  });

  it('renders accessible comparison table', () => {
    render(
      <TierComparisonTable
        tiers={[
          demoTier,
          { ...demoTier, id: 'patron', name: 'Patron', benefits: ['Early access'] },
        ]}
      />,
    );
    expect(screen.getByLabelText('Membership tier comparison')).toBeTruthy();
  });

  it('shows cancellation access in billing panel', () => {
    render(
      <BillingStatusPanel
        billing={{
          tierName: 'Supporter',
          renewsAt: 'Jun 1',
          amountLabel: '$5/mo',
          status: 'active',
          cancelAccessible: true,
        }}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Cancel membership')).toBeTruthy();
  });
});
