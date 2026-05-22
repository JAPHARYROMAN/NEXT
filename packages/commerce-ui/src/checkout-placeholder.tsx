'use client';

import { Surface } from '@next/ui';

export interface CheckoutPlaceholderProps {
  readonly totalLabel: string;
  readonly itemCount: number;
  readonly onConfirm?: () => void;
}

export function CheckoutPlaceholder({
  totalLabel,
  itemCount,
  onConfirm,
}: CheckoutPlaceholderProps) {
  return (
    <Surface bordered className="p-5" aria-label="Checkout placeholder">
      <h3 className="text-sm font-medium text-fg">Checkout</h3>
      <p className="mt-2 text-sm text-muted">
        Contract-ready shell — payment provider integration pending.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Items</dt>
          <dd className="text-fg">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Total</dt>
          <dd className="text-fg">{totalLabel}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 w-full rounded-lg border border-subtle/20 px-4 py-2.5 text-sm"
      >
        Place order (demo)
      </button>
    </Surface>
  );
}
