'use client';

import clsx from 'clsx';
import { useOfflineSyncStore } from '@next/frontend-utils';

export interface SyncIndicatorProps {
  readonly className?: string;
}

export function SyncIndicator({ className }: SyncIndicatorProps) {
  const connection = useOfflineSyncStore((s) => s.connection);
  const pending = useOfflineSyncStore((s) => s.pendingCount);

  const label =
    connection === 'offline'
      ? 'Offline — saved content available'
      : connection === 'syncing'
        ? `Syncing ${pending} items`
        : 'Online';

  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
        connection === 'offline' && 'bg-amber-500/15 text-amber-200',
        connection === 'syncing' && 'bg-brand/15 text-brand',
        connection === 'online' && 'bg-emerald-500/15 text-emerald-200',
        className,
      )}
    >
      <span
        className={clsx(
          'h-2 w-2 rounded-full',
          connection === 'offline' && 'bg-amber-400',
          connection === 'syncing' && 'animate-pulse bg-brand',
          connection === 'online' && 'bg-emerald-400',
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
