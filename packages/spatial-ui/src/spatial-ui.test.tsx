import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpatialShell } from './spatial-shell';
import { LayeredNav } from './layered-nav';

describe('spatial-ui', () => {
  it('renders spatial shell', () => {
    render(<SpatialShell>Spatial content</SpatialShell>);
    expect(screen.getByText('Spatial content')).toBeTruthy();
  });

  it('renders layered nav tabs', () => {
    render(
      <LayeredNav
        activeId="a"
        onActiveChange={() => {}}
        layers={[
          { id: 'a', label: 'Near', content: <p>Near panel</p> },
          { id: 'b', label: 'Far', content: <p>Far panel</p> },
        ]}
      />,
    );
    expect(screen.getByRole('tablist', { name: 'Spatial layers' })).toBeTruthy();
    expect(screen.getByText('Near panel')).toBeTruthy();
  });
});
