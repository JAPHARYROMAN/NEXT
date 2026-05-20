'use client';

import clsx from 'clsx';

export type AppealStatus = 'none' | 'pending' | 'reviewing' | 'resolved';

export interface AppealStatusPanelProps {
  readonly status: AppealStatus;
  readonly referenceId?: string;
  readonly className?: string;
}

const statusCopy: Record<AppealStatus, string> = {
  none: 'No active appeal',
  pending: 'Appeal submitted — awaiting review',
  reviewing: 'Under human review',
  resolved: 'Appeal resolved',
};

export function AppealStatusPanel({ status, referenceId, className }: AppealStatusPanelProps) {
  return (
    <div className={clsx('rounded-lg bg-surface/50 p-3 text-sm', className)} role="status">
      <p className="font-medium">{statusCopy[status]}</p>
      {referenceId ? (
        <p className="mt-1 text-xs text-subtle">Ref {referenceId} — API placeholder</p>
      ) : null}
    </div>
  );
}
