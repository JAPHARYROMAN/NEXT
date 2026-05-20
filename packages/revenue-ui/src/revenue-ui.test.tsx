import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RevenueOverview } from './revenue-overview';
import { PayoutStatusPanel } from './payout-status-panel';
import { RevenueHealthIndicator } from './revenue-health-indicator';

describe('revenue-ui', () => {
  it('renders revenue overview metrics', () => {
    render(
      <RevenueOverview metrics={[{ label: 'Earnings (30d)', value: '$4,280', delta: '+12%' }]} />,
    );
    expect(screen.getByText('$4,280')).toBeTruthy();
  });

  it('renders payout status panel accessibly', () => {
    render(
      <PayoutStatusPanel
        availableTotal="$1,240"
        pendingTotal="$380"
        payouts={[{ id: '1', amount: '$620', status: 'scheduled', date: 'May 25' }]}
      />,
    );
    expect(screen.getByLabelText('Payout status')).toBeTruthy();
  });

  it('shows revenue health indicator', () => {
    render(<RevenueHealthIndicator health="healthy" />);
    expect(screen.getByLabelText('Revenue health')).toBeTruthy();
  });
});
