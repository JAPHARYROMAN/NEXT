import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DepthLayout } from './depth-layout';

describe('DepthLayout', () => {
  it('renders foreground content', () => {
    render(<DepthLayout ambient={<span>Ambient</span>} foreground={<p>Foreground</p>} />);
    expect(screen.getByText('Foreground')).toBeTruthy();
    expect(screen.getByText('Ambient')).toBeTruthy();
  });
});
