'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface ToastProps {
  readonly title: string;
  readonly description?: string;
  readonly tone?: ToastTone;
  readonly action?: ReactNode;
  readonly className?: string;
}

const toneBorder: Record<ToastTone, string> = {
  neutral: 'border-subtle/20',
  success: 'border-success/40',
  danger: 'border-danger/40',
};

export function Toast({ title, description, tone = 'neutral', action, className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex max-w-sm items-start gap-3 rounded-xl border bg-elevated p-4 shadow-elevation2',
        toneBorder[tone],
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
