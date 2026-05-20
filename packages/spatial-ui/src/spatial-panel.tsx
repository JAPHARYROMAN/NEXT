'use client';

import { DepthTransition } from '@next/ambient-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { depthLayers } from '@next/design-system';

export interface SpatialPanelProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly layer?: keyof typeof depthLayers;
  readonly className?: string;
}

export function SpatialPanel({ children, title, layer = 'content', className }: SpatialPanelProps) {
  return (
    <DepthTransition>
      <section
        className={clsx(
          'rounded-2xl border border-white/10 bg-surface/80 p-6 backdrop-blur-sm',
          className,
        )}
        style={{ zIndex: depthLayers[layer] }}
        data-spatial-layer={layer}
        aria-label={title}
      >
        {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
        {children}
      </section>
    </DepthTransition>
  );
}
