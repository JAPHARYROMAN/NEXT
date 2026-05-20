'use client';

import clsx from 'clsx';
import { useOfflineSyncStore } from '@next/frontend-utils';

export interface OfflineDraftShellProps {
  readonly className?: string;
}

export function OfflineDraftShell({ className }: OfflineDraftShellProps) {
  const drafts = useOfflineSyncStore((s) => s.drafts);

  return (
    <section className={clsx('space-y-3', className)} aria-label="Offline drafts">
      <h3 className="font-display text-lg font-semibold">Drafts</h3>
      {!drafts.length ? (
        <p className="text-sm text-muted">Upload drafts sync when you reconnect.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li key={d.id} className="rounded-xl border border-subtle/15 px-4 py-3 text-sm">
              <span className="font-medium">{d.title}</span>
              <span className="ml-2 text-muted">· {d.syncState}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
