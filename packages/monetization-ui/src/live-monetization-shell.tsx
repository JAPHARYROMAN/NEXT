'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface LiveMonetizationShellProps {
  readonly tipsEnabled?: boolean;
  readonly paidEvent?: boolean;
  readonly membersOnly?: boolean;
  readonly sponsorshipLabel?: string;
  readonly className?: string;
}

export function LiveMonetizationShell({
  tipsEnabled = true,
  paidEvent = false,
  membersOnly = false,
  sponsorshipLabel,
  className,
}: LiveMonetizationShellProps) {
  return (
    <Surface
      bordered
      className={clsx('space-y-3 p-4 text-sm', className)}
      aria-label="Live monetization"
    >
      <h3 className="font-medium">Support & transparency</h3>
      {tipsEnabled ? (
        <p className="text-muted">Appreciation tips — voluntary, no gamification (placeholder)</p>
      ) : null}
      {paidEvent ? (
        <p className="text-muted">Paid event ticket — disclosed before entry (placeholder)</p>
      ) : null}
      {membersOnly ? (
        <p className="text-muted">Member-only room — entitlement gate (placeholder)</p>
      ) : null}
      {sponsorshipLabel ? (
        <p className="text-xs text-muted">Sponsored segment · {sponsorshipLabel}</p>
      ) : null}
      <p className="text-xs text-muted">
        Premium chat & product mentions — calm, opt-in placeholders
      </p>
    </Surface>
  );
}
