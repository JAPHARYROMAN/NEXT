'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface MobileCommunityShellProps {
  readonly title: string;
  readonly discussion?: ReactNode;
  readonly liveChat?: ReactNode;
  readonly className?: string;
}

export function MobileCommunityShell({
  title,
  discussion,
  liveChat,
  className,
}: MobileCommunityShellProps) {
  return (
    <div className={clsx('flex min-h-0 flex-col gap-4', className)}>
      <header>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted">Compact social — calm, readable threads.</p>
      </header>
      {liveChat ? (
        <section
          aria-label="Live chat"
          className="max-h-40 overflow-y-auto rounded-xl border border-subtle/15 p-3"
        >
          {liveChat}
        </section>
      ) : null}
      {discussion ? (
        <section aria-label="Discussion" className="flex-1 space-y-3 overflow-y-auto">
          {discussion}
        </section>
      ) : null}
    </div>
  );
}
