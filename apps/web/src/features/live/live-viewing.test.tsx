import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LiveViewing } from './live-viewing';

describe('LiveViewing', () => {
  it('renders live metadata and chat', () => {
    render(<LiveViewing streamId="live-1" />);
    expect(screen.getByLabelText('Event metadata')).toBeTruthy();
    expect(screen.getByLabelText('Live chat panel')).toBeTruthy();
  });

  it('shows post-live transition for ended stream', () => {
    render(<LiveViewing streamId="live-ended" />);
    expect(screen.getByLabelText('Post-live transition')).toBeTruthy();
  });
});
