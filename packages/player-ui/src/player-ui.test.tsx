import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TouchScrubber } from './touch-scrubber';

describe('player-ui mobile', () => {
  it('renders touch scrubber', () => {
    render(<TouchScrubber value={30} max={100} onChange={() => {}} playing />);
    expect(screen.getByLabelText('Playback progress')).toBeTruthy();
    expect(screen.getByText('Playing')).toBeTruthy();
  });
});
