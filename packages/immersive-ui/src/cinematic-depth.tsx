'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { depthShadows, spatialScale } from '@next/design-system';

export interface CinematicDepthProps {
  readonly children: ReactNode;
  readonly tier?: keyof typeof spatialScale;
  readonly className?: string;
}

export function CinematicDepth({ children, tier = 'mid', className }: CinematicDepthProps) {
  const scale = spatialScale[tier];
  const shadow = depthShadows[tier === 'ambient' ? 'ambient' : tier === 'far' ? 'far' : 'mid'];

  return (
    <div
      className={clsx('transition-transform duration-500', className)}
      style={{ transform: `scale(${scale})`, boxShadow: shadow }}
      data-cinematic-tier={tier}
    >
      {children}
    </div>
  );
}
