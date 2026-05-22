'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { depthLayers } from '@next/design-system';

export interface DepthLayoutProps {
  readonly foreground: ReactNode;
  readonly ambient?: ReactNode;
  readonly chrome?: ReactNode;
  readonly className?: string;
}

/** Depth-aware layout — ambient behind, content mid, chrome forward */
export function DepthLayout({ foreground, ambient, chrome, className }: DepthLayoutProps) {
  return (
    <div className={clsx('relative min-h-[60vh]', className)} data-layout="depth">
      {ambient ? (
        <div className="absolute inset-0" style={{ zIndex: depthLayers.ambient }}>
          {ambient}
        </div>
      ) : null}
      <div className="relative" style={{ zIndex: depthLayers.content }}>
        {foreground}
      </div>
      {chrome ? (
        <div className="relative mt-8" style={{ zIndex: depthLayers.chrome }}>
          {chrome}
        </div>
      ) : null}
    </div>
  );
}
