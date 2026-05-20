'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface AdaptiveLayoutProps {
  readonly sidebar?: ReactNode;
  readonly main: ReactNode;
  readonly rail?: ReactNode;
  readonly player?: ReactNode;
  readonly className?: string;
}

export function AdaptiveLayout({ sidebar, main, rail, player, className }: AdaptiveLayoutProps) {
  const bp = useBreakpoint();
  const isCompact = bp === 'sm' || bp === 'md';
  const hasRail = Boolean(rail) && !isCompact;

  return (
    <div className={clsx('flex min-h-dvh flex-col bg-bg', className)}>
      {player ? <div className="shrink-0 border-b border-subtle/15">{player}</div> : null}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && !isCompact ? (
          <aside className="hidden w-60 shrink-0 border-r border-subtle/15 lg:block">
            {sidebar}
          </aside>
        ) : null}
        <main className="min-w-0 flex-1 overflow-y-auto">{main}</main>
        {hasRail ? (
          <aside className="hidden w-80 shrink-0 border-l border-subtle/15 xl:block">{rail}</aside>
        ) : null}
      </div>
    </div>
  );
}
