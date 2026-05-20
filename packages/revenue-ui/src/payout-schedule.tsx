'use client';

import { Surface } from '@next/ui';

export interface PayoutScheduleProps {
  readonly nextPayoutDate: string;
  readonly frequency: string;
  readonly minimumThreshold: string;
  readonly methodLabel: string;
}

export function PayoutSchedule({
  nextPayoutDate,
  frequency,
  minimumThreshold,
  methodLabel,
}: PayoutScheduleProps) {
  return (
    <Surface bordered className="p-5" aria-label="Payout schedule">
      <h3 className="text-sm font-medium text-fg">Payout schedule</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Next payout</dt>
          <dd className="text-fg">{nextPayoutDate}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Frequency</dt>
          <dd className="text-fg">{frequency}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Minimum threshold</dt>
          <dd className="text-fg">{minimumThreshold}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Method</dt>
          <dd className="text-fg">{methodLabel}</dd>
        </div>
      </dl>
    </Surface>
  );
}
