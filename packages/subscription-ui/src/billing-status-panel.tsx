'use client';

import { Surface } from '@next/ui';
import { EntitlementBadge } from '@next/entitlement-ui';
import type { BillingStatus } from './types';

export interface BillingStatusPanelProps {
  readonly billing: BillingStatus;
  readonly onManage?: () => void;
  readonly onCancel?: () => void;
}

const statusToEntitlement = {
  active: 'entitled' as const,
  grace: 'grace' as const,
  expired: 'expired' as const,
  cancelled_pending: 'grace' as const,
};

export function BillingStatusPanel({ billing, onManage, onCancel }: BillingStatusPanelProps) {
  return (
    <Surface bordered className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-fg">Billing status</h3>
          <p className="mt-1 text-sm text-muted">
            {billing.tierName} · {billing.amountLabel}
          </p>
        </div>
        <EntitlementBadge state={statusToEntitlement[billing.status]} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Next renewal</dt>
          <dd className="text-fg">{billing.renewsAt}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Cancellation</dt>
          <dd className="text-fg">
            {billing.cancelAccessible ? 'One-click, no retention maze' : 'Contact support'}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {onManage ? (
          <button
            type="button"
            onClick={onManage}
            className="rounded-lg border border-subtle/20 px-3 py-2 text-sm hover:bg-elevated/50"
          >
            Manage billing
          </button>
        ) : null}
        {billing.cancelAccessible && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg"
          >
            Cancel membership
          </button>
        ) : null}
      </div>
    </Surface>
  );
}
