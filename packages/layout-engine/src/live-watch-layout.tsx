'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { SplitView } from './split-view';

export interface LiveWatchLayoutProps {
  readonly stage: ReactNode;
  readonly sidebar: ReactNode;
  readonly meta?: ReactNode;
  readonly chatMode?: 'split' | 'stacked';
  readonly className?: string;
}

export function LiveWatchLayout({
  stage,
  sidebar,
  meta,
  chatMode = 'split',
  className,
}: LiveWatchLayoutProps) {
  return (
    <div className={clsx('space-y-6', className)} data-live-layout={chatMode}>
      {meta}
      <SplitView ratio="70-30" primary={stage} secondary={sidebar} />
    </div>
  );
}
