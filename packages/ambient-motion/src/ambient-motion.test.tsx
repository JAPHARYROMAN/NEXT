import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DepthTransition } from './depth-transition';
import { ParallaxLayer } from './parallax-layer';

describe('ambient-motion', () => {
  it('renders depth transition children', () => {
    render(<DepthTransition>Spatial layer</DepthTransition>);
    expect(screen.getByText('Spatial layer')).toBeTruthy();
  });

  it('sets parallax depth attribute', () => {
    render(<ParallaxLayer depth="far">Far layer</ParallaxLayer>);
    expect(screen.getByText('Far layer').closest('[data-parallax-depth="far"]')).toBeTruthy();
  });
});
