'use client';

import { Surface } from '@next/ui';
import type { StoreProduct } from './types';

export interface ProductDetailPanelProps {
  readonly product: StoreProduct;
  readonly onCheckout?: () => void;
}

export function ProductDetailPanel({ product, onCheckout }: ProductDetailPanelProps) {
  return (
    <Surface bordered className="p-5" aria-label="Product details">
      <p className="text-xs text-muted">{product.type}</p>
      <h2 className="mt-1 text-lg font-medium text-fg">{product.title}</h2>
      <p className="mt-2 text-sm text-muted">{product.description}</p>
      <p className="mt-4 text-xl font-semibold text-fg">{product.priceLabel}</p>
      <button
        type="button"
        onClick={onCheckout}
        className="mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
      >
        Continue to checkout
      </button>
      <p className="mt-2 text-xs text-muted">No pressure — review before confirming.</p>
    </Surface>
  );
}
