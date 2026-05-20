import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonetizationHub } from '@/features/monetization/monetization-hub';
import { SubscriptionsExperience } from '@/features/monetization/subscriptions-experience';

describe('monetization experience', () => {
  it('renders monetization hub links', () => {
    render(<MonetizationHub />);
    expect(screen.getByText('Subscriptions')).toBeTruthy();
    expect(screen.getByText('Premium content')).toBeTruthy();
  });

  it('renders subscription tier comparison accessibly', () => {
    render(<SubscriptionsExperience />);
    expect(screen.getByLabelText('Membership tier comparison')).toBeTruthy();
  });
});
