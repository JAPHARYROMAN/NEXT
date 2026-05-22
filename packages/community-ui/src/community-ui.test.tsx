import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityHeader } from './community-header';
import { JoinFlow } from './join-flow';

describe('community-ui', () => {
  it('renders community header', () => {
    render(
      <CommunityHeader
        name="Quiet Signals"
        tagline="Slow cinema and ambient scores"
        memberCount="12.4k"
        activeNow={4}
      />,
    );
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByText('Quiet Signals')).toBeTruthy();
  });

  it('renders join flow intro', () => {
    render(<JoinFlow communityName="Test Circle" />);
    expect(screen.getByText(/Join Test Circle/)).toBeTruthy();
  });
});
