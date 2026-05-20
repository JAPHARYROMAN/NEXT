import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContextualNavBar } from './contextual-nav-bar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/mobile',
}));

describe('navigation-ui', () => {
  it('renders contextual nav bar', () => {
    render(<ContextualNavBar title="Feed" />);
    expect(screen.getByRole('heading', { name: 'Feed' })).toBeTruthy();
    expect(screen.getByLabelText('Show navigation')).toBeTruthy();
  });
});
