import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExploreHero } from './explore-hero';
import { ChaosEntry } from './chaos-entry';

describe('explore-ui', () => {
  it('renders explore hero', () => {
    render(<ExploreHero />);
    expect(screen.getByRole('heading', { name: 'Explore' })).toBeTruthy();
  });

  it('renders chaos entry link', () => {
    render(<ChaosEntry />);
    expect(screen.getByText(/Enter the unexpected/)).toBeTruthy();
  });
});
