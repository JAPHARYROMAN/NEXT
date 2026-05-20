import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CinematicDepth } from './cinematic-depth';
import { ImmersiveShell } from './immersive-shell';

describe('immersive-ui', () => {
  it('renders immersive shell with environment region', () => {
    render(<ImmersiveShell>Immersive body</ImmersiveShell>);
    expect(screen.getByRole('region', { name: 'Ambient environment' })).toBeTruthy();
    expect(screen.getByText('Immersive body')).toBeTruthy();
  });

  it('applies cinematic depth tier', () => {
    render(<CinematicDepth tier="near">Depth content</CinematicDepth>);
    expect(screen.getByText('Depth content').closest('[data-cinematic-tier="near"]')).toBeTruthy();
  });
});
