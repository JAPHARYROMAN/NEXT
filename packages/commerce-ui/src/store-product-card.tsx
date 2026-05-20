'use client';

import { Surface } from '@next/ui';
import type { StoreProduct } from './types';

export interface StoreProductCardProps {
  readonly product: StoreProduct;
  readonly onSelect?: (id: string) => void;
}

export function StoreProductCard({ product, onSelect }: StoreProductCardProps) {
  return (
    <Surface bordered className="overflow-hidden">
      <div
        className="h-28 bg-gradient-to-br from-accent/20 to-transparent"
        style={product.hue != null ? { filter: `hue-rotate(${product.hue}deg)` } : undefined}
        aria-hidden
      />
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted">{product.type}</p>
        <h3 className="mt-1 text-sm font-medium text-fg">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-fg">{product.priceLabel}</span>
          <button
            type="button"
            onClick={() => onSelect?.(product.id)}
            className="text-xs text-accent hover:underline"
          >
            View
          </button>
        </div>
      </div>
    </Surface>
  );
}
