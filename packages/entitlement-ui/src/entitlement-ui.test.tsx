import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EntitlementBadge } from './entitlement-badge';
import { EntitlementGate } from './entitlement-gate';
import { EntitlementStatePanel } from './entitlement-state-panel';

describe('entitlement-ui', () => {
  it('renders entitlement badge with accessible label', () => {
    render(<EntitlementBadge state="grace" />);
    expect(screen.getByLabelText('Access status: Grace period')).toBeTruthy();
  });

  it('shows children when entitled', () => {
    render(
      <EntitlementGate state="entitled" title="Premium">
        <p>Premium content</p>
      </EntitlementGate>,
    );
    expect(screen.getByText('Premium content')).toBeTruthy();
  });

  it('shows gate when not entitled', () => {
    render(
      <EntitlementGate
        state="not_entitled"
        title="Members only"
        description="Support the creator to unlock."
      />,
    );
    expect(screen.getByText('Members only')).toBeTruthy();
  });

  it('renders entitlement state panel', () => {
    render(
      <EntitlementStatePanel
        entitlements={[
          {
            id: '1',
            resourceId: 'r1',
            resourceLabel: 'Studio sessions',
            state: 'entitled',
            expiresAt: 'Apr 20',
          },
        ]}
      />,
    );
    expect(screen.getByLabelText('Your access')).toBeTruthy();
    expect(screen.getByText('Studio sessions')).toBeTruthy();
  });
});
