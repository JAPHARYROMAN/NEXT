'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface OnboardingLayoutProps {
  readonly children: ReactNode;
  readonly aside?: ReactNode;
  readonly className?: string;
}

/** Adaptive shell for welcome, onboarding, privacy, and first-run flows. */
export function OnboardingLayout({ children, aside, className }: OnboardingLayoutProps) {
  const bp = useBreakpoint();
  const isWide = bp === 'lg' || bp === 'xl';

  return (
    <div
      className={clsx(
        'min-h-[calc(100dvh-4rem)] px-4 py-8 sm:px-6 lg:px-10',
        isWide && aside && 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12',
        className,
      )}
    >
      <main className="min-w-0">{children}</main>
      {aside && isWide ? (
        <aside className="hidden lg:block" aria-label="Onboarding context">
          {aside}
        </aside>
      ) : null}
    </div>
  );
}
