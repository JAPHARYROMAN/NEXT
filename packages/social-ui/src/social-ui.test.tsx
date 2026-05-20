import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiscussionThread } from './discussion-thread';
import { WatchPartyRoom } from './watch-party-room';

describe('social-ui', () => {
  it('renders threaded discussion', () => {
    render(
      <DiscussionThread
        title="Thread"
        comments={[{ id: '1', author: 'Alex', body: 'Hello', time: '2m' }]}
      />,
    );
    expect(screen.getByRole('region', { name: 'Thread' })).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders watch party region', () => {
    render(
      <WatchPartyRoom title="Premiere" host="Jordan" participants={[{ id: '1', label: 'Alex' }]} />,
    );
    expect(screen.getByLabelText('Watch party: Premiere')).toBeTruthy();
  });
});
