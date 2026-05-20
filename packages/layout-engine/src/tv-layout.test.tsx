import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TvLayout } from './tv-layout';
import { TheaterLayout } from './theater-layout';

describe('tv layouts', () => {
  it('renders TV home structure', () => {
    render(<TvLayout hero={<h1>Theater</h1>} shelves={<div>Shelves</div>} />);
    expect(screen.getByText('Theater')).toBeTruthy();
    expect(screen.getByText('Shelves')).toBeTruthy();
  });

  it('renders theater playback layout', () => {
    render(<TheaterLayout viewport={<div data-testid="vp" />} rail={<nav>Rail</nav>} />);
    expect(screen.getByTestId('vp')).toBeTruthy();
  });
});
