import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LiveChatPanel } from './live-chat-panel';

describe('chat-ui', () => {
  it('renders chat panel with a11y log', () => {
    render(<LiveChatPanel messages={[{ id: '1', author: 'Sam', body: 'Hello' }]} slowMode />);
    expect(screen.getByLabelText('Live chat panel')).toBeTruthy();
    expect(screen.getByLabelText('Chat messages')).toBeTruthy();
  });
});
