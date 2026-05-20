import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RealtimePresenceShell } from './realtime-presence-shell';

describe('realtime-ui', () => {
  it('renders presence shell', () => {
    render(<RealtimePresenceShell count={420} peak={512} />);
    expect(screen.getByLabelText('Realtime presence')).toBeTruthy();
    expect(screen.getByText('420')).toBeTruthy();
  });
});
