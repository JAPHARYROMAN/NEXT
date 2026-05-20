'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { PayoutRecord } from './types';

const statusLabels: Record<PayoutRecord['status'], string> = {
  available: 'Available',
  pending: 'Pending',
  scheduled: 'Scheduled',
  failed: 'Failed',
  hold: 'On hold',
};

const statusTone: Record<PayoutRecord['status'], string> = {
  available: 'text-emerald-300',
  pending: 'text-muted',
  scheduled: 'text-sky-300',
  failed: 'text-red-300',
  hold: 'text-amber-300',
};

export interface PayoutStatusPanelProps {
  readonly payouts: readonly PayoutRecord[];
  readonly availableTotal: string;
  readonly pendingTotal: string;
}

export function PayoutStatusPanel({
  payouts,
  availableTotal,
  pendingTotal,
}: PayoutStatusPanelProps) {
  return (
    <Surface bordered className="p-5" aria-label="Payout status">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted">Available</p>
          <p className="text-xl font-semibold text-fg">{availableTotal}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Pending</p>
          <p className="text-xl font-semibold text-fg">{pendingTotal}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2" role="list">
        {payouts.map((payout) => (
          <li
            key={payout.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-subtle/10 px-3 py-2 text-sm"
          >
            <div>
              <p className="text-fg">{payout.amount}</p>
              <p className="text-xs text-muted">
                {payout.date}
                {payout.methodLabel ? ` · ${payout.methodLabel}` : ''}
              </p>
            </div>
            <span className={clsx('text-xs font-medium', statusTone[payout.status])}>
              {statusLabels[payout.status]}
            </span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
