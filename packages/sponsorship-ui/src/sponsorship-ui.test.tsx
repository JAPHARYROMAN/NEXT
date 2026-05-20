import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreatorOpportunityCard } from './creator-opportunity-card';
import { DeliverablesChecklist } from './deliverables-checklist';
import { SponsorshipDisclosureBanner } from './sponsorship-disclosure-banner';

describe('sponsorship-ui', () => {
  it('renders creator opportunity card', () => {
    render(
      <CreatorOpportunityCard
        opportunity={{
          id: '1',
          brand: 'Quiet Audio',
          title: 'Spring launch',
          budgetLabel: '$2,500',
          deliverables: ['60s integration'],
          status: 'proposed',
          payoutEstimate: '$2,100',
        }}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText('Spring launch')).toBeTruthy();
  });

  it('renders deliverables checklist', () => {
    render(
      <DeliverablesChecklist items={[{ id: 'd1', label: 'Draft script', completed: false }]} />,
    );
    expect(screen.getByLabelText('Deliverables checklist')).toBeTruthy();
  });

  it('shows disclosure banner', () => {
    render(<SponsorshipDisclosureBanner brand="Quiet Audio" />);
    expect(screen.getByLabelText('Sponsorship disclosure reminder')).toBeTruthy();
  });
});
