'use client';

import clsx from 'clsx';
import { Button, Surface } from '@next/ui';
import type { ReadinessState } from './types';

export interface GoLiveConfirmationProps {
  readonly readiness: ReadinessState;
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly className?: string;
}

export function GoLiveConfirmation({
  readiness,
  onConfirm,
  onCancel,
  className,
}: GoLiveConfirmationProps) {
  const canGo = readiness === 'ready';

  return (
    <Surface
      bordered
      className={clsx('space-y-4 p-5', className)}
      role="dialog"
      aria-label="Go live confirmation"
    >
      <h3 className="font-display text-lg font-medium">Ready to go live?</h3>
      <p className="text-sm text-muted">
        Your audience will see the stage when you confirm. Take a breath — you can pause safely.
      </p>
      <div className="flex gap-2">
        <Button variant="primary" disabled={!canGo} onClick={onConfirm}>
          Go live
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Not yet
        </Button>
      </div>
    </Surface>
  );
}
