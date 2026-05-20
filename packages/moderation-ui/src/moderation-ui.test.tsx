import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModerationConsole } from './moderation-console';

describe('moderation-ui', () => {
  it('renders moderation console', () => {
    render(
      <ModerationConsole
        flagged={[{ id: '1', author: '@x', excerpt: 'test', reason: 'spam' }]}
        muted={[]}
      />,
    );
    expect(screen.getByLabelText('Moderation console')).toBeTruthy();
  });
});
