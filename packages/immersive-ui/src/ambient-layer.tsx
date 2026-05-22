'use client';

import clsx from 'clsx';
import { ParallaxLayer } from '@next/ambient-motion';
import type { ReactNode } from 'react';

export interface AmbientLayerProps {
  readonly children: ReactNode;
  readonly depth?: 'near' | 'mid' | 'far';
  readonly className?: string;
}

export function AmbientLayer({ children, depth = 'far', className }: AmbientLayerProps) {
  return (
    <ParallaxLayer
      depth={depth}
      className={clsx('pointer-events-none absolute inset-0', className)}
    >
      {children}
    </ParallaxLayer>
  );
}
