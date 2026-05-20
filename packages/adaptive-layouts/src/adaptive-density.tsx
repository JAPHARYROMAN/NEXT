'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { resolveDensity, useViewport } from '@next/responsive-engine';

export interface AdaptiveDensityProps {
  readonly children: ReactNode;
  readonly compact?: ReactNode;
  readonly immersive?: ReactNode;
  readonly className?: string;
}

export function AdaptiveDensity({ children, compact, immersive, className }: AdaptiveDensityProps) {
  const { device } = useViewport();
  const density = resolveDensity(device);
  const content =
    density === 'compact' && compact
      ? compact
      : density === 'immersive' && immersive
        ? immersive
        : children;

  return (
    <div className={clsx('w-full', className)} data-density={density}>
      {content}
    </div>
  );
}
