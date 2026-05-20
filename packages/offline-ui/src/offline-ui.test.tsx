import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useOfflineSyncStore } from '@next/frontend-utils';
import { SyncIndicator } from './sync-indicator';

describe('offline-ui', () => {
  beforeEach(() => {
    useOfflineSyncStore.setState({
      connection: 'online',
      pendingCount: 0,
      downloads: [],
      drafts: [],
    });
  });

  it('shows online sync indicator', () => {
    render(<SyncIndicator />);
    expect(screen.getByRole('status').textContent).toContain('Online');
  });

  it('shows offline state', () => {
    useOfflineSyncStore.setState({ connection: 'offline' });
    render(<SyncIndicator />);
    expect(screen.getByText(/Offline/)).toBeTruthy();
  });
});
