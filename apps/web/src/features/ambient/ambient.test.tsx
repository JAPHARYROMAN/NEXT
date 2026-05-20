import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AmbientExperience } from './ambient-experience';

describe('AmbientExperience', () => {
  it('renders ambient heading', () => {
    render(<AmbientExperience />);
    expect(screen.getByText('Calm playback environments')).toBeTruthy();
  });
});
