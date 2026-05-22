import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LiveChatShell } from './live-chat-shell';
import { ModerationBanner } from './moderation-banner';
import { StreamStatusBadge } from './stream-status-badge';
import { LiveCountdown } from './live-countdown';

describe('live-ui', () => {
  it('renders live chat', () => {
    render(<LiveChatShell messages={[{ id: '1', author: 'Sam', body: 'Hello live' }]} />);
    expect(screen.getByLabelText('Live chat')).toBeTruthy();
  });

  it('renders moderation alert', () => {
    render(<ModerationBanner message="Slow mode enabled" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders stream status', () => {
    render(<StreamStatusBadge status="live" />);
    expect(screen.getByText('Live')).toBeTruthy();
  });

  it('renders countdown', () => {
    render(<LiveCountdown title="Premiere" startsInSec={125} premiere />);
    expect(screen.getByLabelText('Live countdown')).toBeTruthy();
  });
});
