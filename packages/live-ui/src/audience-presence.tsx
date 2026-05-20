'use client';

import clsx from 'clsx';

export interface AudiencePresenceProps {
  readonly count: number;
  readonly peak?: number;
  readonly className?: string;
}

export function AudiencePresence({ count, peak, className }: AudiencePresenceProps) {
  return (
    <p className={clsx('text-sm text-muted', className)} role="status">
      <span className="font-medium text-accent">{count.toLocaleString()}</span> watching
      {peak != null ? <span className="text-subtle"> · peak {peak.toLocaleString()}</span> : null}
    </p>
  );
}
