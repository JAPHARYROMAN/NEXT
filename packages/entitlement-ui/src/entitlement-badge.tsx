'use client';

import clsx from 'clsx';
import { ENTITLEMENT_LABELS, type EntitlementState } from './types';

export interface EntitlementBadgeProps {
  readonly state: EntitlementState;
  readonly className?: string;
}

const toneFor: Record<EntitlementState, string> = {
  entitled: 'bg-emerald-500/15 text-emerald-200',
  not_entitled: 'bg-subtle/20 text-muted',
  expired: 'bg-amber-500/15 text-amber-200',
  grace: 'bg-sky-500/15 text-sky-200',
  pending_payment: 'bg-violet-500/15 text-violet-200',
  refund_pending: 'bg-orange-500/15 text-orange-200',
  revoked: 'bg-red-500/15 text-red-200',
  creator_comp: 'bg-accent/15 text-accent',
};

export function EntitlementBadge({ state, className }: EntitlementBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneFor[state],
        className,
      )}
      aria-label={`Access status: ${ENTITLEMENT_LABELS[state]}`}
    >
      {ENTITLEMENT_LABELS[state]}
    </span>
  );
}
