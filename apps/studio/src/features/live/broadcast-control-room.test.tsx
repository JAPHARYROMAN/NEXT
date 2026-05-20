import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BroadcastControlRoom } from './broadcast-control-room';

describe('BroadcastControlRoom', () => {
  it('renders control room regions', () => {
    render(<BroadcastControlRoom />);
    expect(screen.getByText('Broadcast control room')).toBeTruthy();
    expect(screen.getByLabelText('Stream health metrics')).toBeTruthy();
    expect(screen.getByLabelText('Moderation console')).toBeTruthy();
  });
});
