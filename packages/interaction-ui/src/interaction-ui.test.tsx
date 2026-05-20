import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiscussionShell } from './discussion-shell';

describe('interaction-ui', () => {
  it('renders discussion region', () => {
    render(<DiscussionShell title="Thread" />);
    expect(screen.getByLabelText('Thread')).toBeTruthy();
  });
});
