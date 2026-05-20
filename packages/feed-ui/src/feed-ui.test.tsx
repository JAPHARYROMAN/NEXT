import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedTypeTabs } from './feed-type-tabs';

describe('feed-ui', () => {
  it('renders feed mode tabs', () => {
    render(<FeedTypeTabs mode="precision" onChange={() => {}} />);
    expect(screen.getByRole('tablist', { name: 'Feed mode' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Chaos/ })).toBeTruthy();
  });
});
