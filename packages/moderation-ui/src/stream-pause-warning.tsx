'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface StreamPauseWarningProps {
  readonly reason?: string;
  readonly className?: string;
}

export function StreamPauseWarning({
  reason = 'Safety review in progress — stream may pause briefly.',
  className,
}: StreamPauseWarningProps) {
  return (
    <Surface
      bordered
      className={clsx('border-danger/25 bg-danger/5 p-4 text-sm', className)}
      role="alert"
      aria-label="Stream pause warning"
    >
      <p className="font-medium">Stream safety</p>
      <p className="mt-1 text-muted">{reason}</p>
    </Surface>
  );
}
