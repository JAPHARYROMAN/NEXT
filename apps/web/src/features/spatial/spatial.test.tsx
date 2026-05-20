import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpatialExperience } from './spatial-experience';

describe('SpatialExperience', () => {
  it('renders spatial heading', () => {
    render(<SpatialExperience />);
    expect(screen.getByText('Depth-aware discovery')).toBeTruthy();
  });
});
