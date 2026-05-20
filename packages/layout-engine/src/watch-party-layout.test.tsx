import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WatchPartyLayout } from './watch-party-layout';

describe('WatchPartyLayout', () => {
  it('renders viewport and social regions', () => {
    render(<WatchPartyLayout viewport={<div>Viewport</div>} social={<aside>Social</aside>} />);
    expect(screen.getByText('Viewport')).toBeTruthy();
    expect(screen.getByText('Social')).toBeTruthy();
  });
});
