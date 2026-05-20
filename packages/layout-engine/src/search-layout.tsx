'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface SearchLayoutProps {
  readonly sidebar?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function SearchLayout({ sidebar, children, className }: SearchLayoutProps) {
  const bp = useBreakpoint();
  const isCompact = bp === 'sm' || bp === 'md';

  return (
    <div
      className={clsx(
        'mx-auto max-w-7xl',
        sidebar && !isCompact ? 'grid gap-8 lg:grid-cols-[220px_1fr]' : 'space-y-8',
        className,
      )}
    >
      {sidebar ? <aside aria-label="Search filters">{sidebar}</aside> : null}
      <main>{children}</main>
    </div>
  );
}
