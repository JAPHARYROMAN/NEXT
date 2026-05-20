'use client';

import { Surface } from '@next/ui';

export interface RenewalTransparencyProps {
  readonly renewsAt: string;
  readonly amountLabel: string;
  readonly paymentMethodLabel: string;
}

export function RenewalTransparency({
  renewsAt,
  amountLabel,
  paymentMethodLabel,
}: RenewalTransparencyProps) {
  return (
    <Surface bordered className="p-5" aria-label="Renewal details">
      <h3 className="text-sm font-medium text-fg">Renewal transparency</h3>
      <p className="mt-2 text-sm text-muted">
        Clear pricing before every charge. You will be notified before renewal.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Next charge</dt>
          <dd className="text-fg">
            {amountLabel} on {renewsAt}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Payment method</dt>
          <dd className="text-fg">{paymentMethodLabel}</dd>
        </div>
      </dl>
    </Surface>
  );
}
