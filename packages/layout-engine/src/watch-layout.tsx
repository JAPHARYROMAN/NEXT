'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { SplitView } from './split-view';
import { useBreakpoint } from './use-breakpoint';

export interface WatchLayoutProps {
  readonly player: ReactNode;
  readonly main: ReactNode;
  readonly aside?: ReactNode;
  readonly discussion?: ReactNode;
  readonly showDiscussion?: boolean;
  readonly className?: string;
}

export function WatchLayout({
  player,
  main,
  aside,
  discussion,
  showDiscussion = false,
  className,
}: WatchLayoutProps) {
  const bp = useBreakpoint();

  if (showDiscussion && discussion) {
    return (
      <div className={clsx('space-y-6', className)}>
        {player}
        <SplitView
          ratio={bp === 'sm' || bp === 'md' ? '50-50' : '60-40'}
          primary={discussion}
          secondary={main}
        />
        {aside ? <aside className="lg:hidden">{aside}</aside> : null}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'grid gap-6',
        aside ? 'lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]' : 'max-w-6xl',
        className,
      )}
    >
      <div className="min-w-0 space-y-6">
        {player}
        {main}
      </div>
      {aside ? <aside className="min-w-0 space-y-4">{aside}</aside> : null}
    </div>
  );
}
