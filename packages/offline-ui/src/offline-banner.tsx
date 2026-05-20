'use client';

import clsx from 'clsx';
import { trackOfflineFriction, useOfflineSyncStore } from '@next/frontend-utils';
import { useEffect } from 'react';

export interface OfflineBannerProps {
  readonly className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const connection = useOfflineSyncStore((s) => s.connection);

  useEffect(() => {
    if (connection === 'offline') trackOfflineFriction('connectivity', 'banner_shown', 'low');
  }, [connection]);

  if (connection !== 'offline') return null;

  return (
    <div
      role="alert"
      className={clsx(
        'border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100',
        className,
      )}
    >
      You&apos;re offline. Downloads and drafts remain available.
    </div>
  );
}
