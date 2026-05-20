import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PurchaseDecisionSurface } from './premium-content';
import { PaidCommunityLanding } from './paid-community';
import { FinancialSafetyNotice } from './trust-commerce';

describe('monetization-ui', () => {
  it('renders purchase decision surface', () => {
    render(
      <PurchaseDecisionSurface
        options={[{ id: 'sub', label: 'Membership', priceLabel: '$5/mo' }]}
      />,
    );
    expect(screen.getByLabelText('Access options')).toBeTruthy();
  });

  it('renders paid community landing', () => {
    render(
      <PaidCommunityLanding
        communityName="Night studio"
        tagline="Calm creative space"
        memberCount={420}
        tiers={[]}
        benefitsPreview={['Member discussions']}
      />,
    );
    expect(screen.getByText('Night studio')).toBeTruthy();
  });

  it('shows financial safety notice', () => {
    render(<FinancialSafetyNotice />);
    expect(screen.getByText(/NEXT never asks for payment credentials/)).toBeTruthy();
  });
});
