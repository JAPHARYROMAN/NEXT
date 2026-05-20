import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AmbientEnvironment } from './ambient-environment';
import { CalmSurface } from './calm-surface';

describe('environment-ui', () => {
  it('renders ambient environment with a11y region', () => {
    render(<AmbientEnvironment>Room content</AmbientEnvironment>);
    expect(screen.getByRole('region', { name: 'Ambient environment' })).toBeTruthy();
    expect(screen.getByText('Room content')).toBeTruthy();
  });

  it('renders calm surface title', () => {
    render(<CalmSurface title="Insight">Low noise info</CalmSurface>);
    expect(screen.getByText('Insight')).toBeTruthy();
  });
});
