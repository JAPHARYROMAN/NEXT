import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HandoffCard } from './handoff-card';
import { useContinuityStore } from '@next/frontend-utils';

describe('mobile-ui', () => {
  it('renders handoff card when resume exists', () => {
    useContinuityStore.setState({
      resume: {
        mediaId: '1',
        title: 'Ambient drift',
        positionSec: 120,
        updatedAt: Date.now(),
      },
      lastDevice: 'phone',
      handoffTarget: null,
      syncedPreferences: {},
    });
    render(<HandoffCard />);
    expect(screen.getByLabelText('Continue watching')).toBeTruthy();
    expect(screen.getByText('Ambient drift')).toBeTruthy();
  });
});
