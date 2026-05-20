'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { PurchaseRecord } from './types';

const accessLabels: Record<PurchaseRecord['accessState'], string> = {
  available: 'Download ready',
  expired: 'Access expired',
  refund_pending: 'Refund pending',
};

export interface PurchaseHistoryPanelProps {
  readonly purchases: readonly PurchaseRecord[];
}

export function PurchaseHistoryPanel({ purchases }: PurchaseHistoryPanelProps) {
  return (
    <Surface bordered className="p-5" aria-label="Purchase history">
      <h3 className="text-sm font-medium text-fg">Purchase history</h3>
      <ul className="mt-4 space-y-2" role="list">
        {purchases.map((purchase) => (
          <li
            key={purchase.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle/10 pb-2 text-sm last:border-0"
          >
            <div>
              <p className="text-fg">{purchase.productTitle}</p>
              <p className="text-xs text-muted">{purchase.purchasedAt}</p>
            </div>
            <span
              className={clsx(
                'text-xs',
                purchase.accessState === 'available' ? 'text-emerald-300' : 'text-muted',
              )}
            >
              {accessLabels[purchase.accessState]}
            </span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
