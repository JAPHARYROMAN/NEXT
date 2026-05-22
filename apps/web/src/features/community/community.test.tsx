import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityHome } from './community-home';
import { demoCommunities } from '@/lib/demo-communities';

describe('CommunityHome', () => {
  it('renders community name', () => {
    const community = demoCommunities[0]!;
    render(<CommunityHome community={community} />);
    expect(screen.getByText(community.name)).toBeTruthy();
  });
});
