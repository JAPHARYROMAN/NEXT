'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface WatchPartyLayoutProps {
  readonly viewport: ReactNode;
  readonly social: ReactNode;
  readonly className?: string;
}

/** Split watch party: stacked on mobile, 70/30 on desktop */
export function WatchPartyLayout({ viewport, social, className }: WatchPartyLayoutProps) {
  return (
    <div className={clsx('grid gap-6', 'grid-cols-1', 'lg:grid-cols-[7fr_3fr]', className)}>
      <div className="min-w-0">{viewport}</div>
      <div className="min-w-0">{social}</div>
    </div>
  );
}
