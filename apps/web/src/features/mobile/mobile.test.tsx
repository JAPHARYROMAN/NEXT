import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resolveDeviceClass, resolveOrientation } from '@next/responsive-engine';
import { MobileHub } from './mobile-hub';
import { useContinuityStore } from '@next/frontend-utils';

vi.mock('next/navigation', () => ({
  usePathname: () => '/mobile',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('mobile experience', () => {
  beforeEach(() => {
    useContinuityStore.setState({
      resume: null,
      lastDevice: 'unknown',
      handoffTarget: null,
      syncedPreferences: {},
    });
  });

  it('classifies phone viewport for adaptive layouts', () => {
    expect(resolveDeviceClass(390, 844)).toBe('phone');
    expect(resolveOrientation(390, 844)).toBe('portrait');
  });

  it('renders mobile hub', () => {
    render(<MobileHub />);
    expect(screen.getByText('NEXT Mobile')).toBeTruthy();
    expect(screen.getByText('Adaptive feed')).toBeTruthy();
  });
});
