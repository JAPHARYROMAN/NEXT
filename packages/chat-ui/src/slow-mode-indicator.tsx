'use client';

import clsx from 'clsx';

export interface SlowModeIndicatorProps {
  readonly seconds?: number;
  readonly className?: string;
}

export function SlowModeIndicator({ seconds = 15, className }: SlowModeIndicatorProps) {
  return (
    <p className={clsx('text-xs text-muted', className)} role="status">
      Slow mode · {seconds}s between messages (placeholder)
    </p>
  );
}
