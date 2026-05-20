'use client';

import clsx from 'clsx';

export interface EscalationBannerProps {
  readonly message: string;
  readonly severity?: 'info' | 'warning' | 'critical';
  readonly className?: string;
}

export function EscalationBanner({
  message,
  severity = 'warning',
  className,
}: EscalationBannerProps) {
  const styles =
    severity === 'critical'
      ? 'border-danger/30 bg-danger/10 text-danger'
      : severity === 'warning'
        ? 'border-accent/30 bg-accent/10 text-accent'
        : 'border-subtle/20 bg-surface/40 text-muted';

  return (
    <div role="alert" className={clsx('rounded-lg border px-4 py-3 text-sm', styles, className)}>
      {message}
    </div>
  );
}
