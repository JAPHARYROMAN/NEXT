'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface LayeredNavLayer {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
}

export interface LayeredNavProps {
  readonly layers: readonly LayeredNavLayer[];
  readonly activeId: string;
  readonly onActiveChange: (id: string) => void;
  readonly className?: string;
}

export function LayeredNav({ layers, activeId, onActiveChange, className }: LayeredNavProps) {
  const active = layers.find((l) => l.id === activeId) ?? layers[0];

  return (
    <div className={clsx('grid gap-6 lg:grid-cols-[14rem_1fr]', className)} data-layered-nav>
      <div className="flex flex-col gap-1" role="tablist" aria-label="Spatial layers">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            role="tab"
            aria-selected={layer.id === activeId}
            className={clsx(
              'rounded-lg px-3 py-2 text-left text-sm',
              layer.id === activeId
                ? 'bg-elevated font-medium text-fg'
                : 'text-muted hover:bg-surface/80',
            )}
            onClick={() => onActiveChange(layer.id)}
          >
            {layer.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-labelledby={active?.id}>
        {active?.content}
      </div>
    </div>
  );
}
