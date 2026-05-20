'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface CreatorWorkspaceProps {
  readonly nav: ReactNode;
  readonly main: ReactNode;
  readonly inspector?: ReactNode;
  readonly className?: string;
}

/** Creator workstation layout — sidebar + main + optional inspector rail. */
export function CreatorWorkspace({ nav, main, inspector, className }: CreatorWorkspaceProps) {
  const bp = useBreakpoint();
  const compact = bp === 'sm' || bp === 'md';

  return (
    <div className={clsx('flex min-h-dvh bg-bg', className)}>
      {!compact ? <aside className="w-56 shrink-0 border-r border-subtle/15">{nav}</aside> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {compact ? <div className="border-b border-subtle/15 p-2">{nav}</div> : null}
        <div className="flex flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto">{main}</main>
          {inspector && !compact ? (
            <aside className="hidden w-72 shrink-0 border-l border-subtle/15 xl:block">
              {inspector}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
