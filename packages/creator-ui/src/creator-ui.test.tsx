import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileHero } from './profile-hero';

describe('creator-ui', () => {
  it('renders profile hero', () => {
    render(<ProfileHero handle="vault" displayName="Vault" followerLabel="24k resonances" />);
    expect(screen.getByText('Vault')).toBeTruthy();
    expect(screen.getByText('@vault')).toBeTruthy();
  });
});
