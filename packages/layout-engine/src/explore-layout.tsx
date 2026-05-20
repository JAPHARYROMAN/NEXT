'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface ExploreLayoutProps {
  readonly waves?: ReactNode;
  readonly hero?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ExploreLayout({ waves, hero, children, className }: ExploreLayoutProps) {
  const bp = useBreakpoint();
  const isUltrawide = bp === 'ultrawide';

  return (
    <div className={clsx('mx-auto max-w-[1600px] space-y-10', className)}>
      {hero}
      <div
        className={clsx(
          'grid gap-8',
          waves ? (isUltrawide ? 'lg:grid-cols-[260px_1fr]' : 'lg:grid-cols-[240px_1fr]') : '',
        )}
      >
        {waves}
        <div className="space-y-12">{children}</div>
      </div>
    </div>
  );
}
