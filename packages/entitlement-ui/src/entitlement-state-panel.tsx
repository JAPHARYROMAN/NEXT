'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import { EntitlementBadge } from './entitlement-badge';
import { ENTITLEMENT_LABELS, type EntitlementRecord } from './types';

export interface EntitlementStatePanelProps {
  readonly entitlements: readonly EntitlementRecord[];
  readonly className?: string;
}

export function EntitlementStatePanel({ entitlements, className }: EntitlementStatePanelProps) {
  return (
    <Surface bordered className={clsx('p-5', className)} aria-label="Your access">
      <h3 className="text-sm font-medium text-fg">Access status</h3>
      <ul className="mt-4 space-y-3" role="list">
        {entitlements.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-subtle/10 px-3 py-2.5"
          >
            <div>
              <p className="text-sm text-fg">{item.resourceLabel}</p>
              <p className="mt-0.5 text-xs text-muted">{ENTITLEMENT_LABELS[item.state]}</p>
              {item.expiresAt ? (
                <p className="mt-1 text-xs text-muted">Renews or expires {item.expiresAt}</p>
              ) : null}
            </div>
            <EntitlementBadge state={item.state} />
          </li>
        ))}
      </ul>
    </Surface>
  );
}
