'use client';

import clsx from 'clsx';

export interface ModerationNoticeProps {
  readonly message: string;
  readonly variant?: 'info' | 'warning';
  readonly className?: string;
}

export function ModerationNotice({ message, variant = 'info', className }: ModerationNoticeProps) {
  return (
    <p
      role="note"
      className={clsx(
        'rounded-lg px-3 py-2 text-xs',
        variant === 'warning' ? 'bg-warning/10 text-warning' : 'bg-surface/60 text-muted',
        className,
      )}
    >
      {message}
    </p>
  );
}
