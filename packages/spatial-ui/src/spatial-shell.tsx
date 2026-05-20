'use client';

import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { depthLayers } from '@next/design-system';
import { useRenderTelemetry } from '@next/frontend-utils';

export interface SpatialShellProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function SpatialShell({ children, className }: SpatialShellProps) {
  useRenderTelemetry('SpatialShell');

  return (
    <div
      className={clsx('spatial-root min-h-screen bg-bg text-fg antialiased', className)}
      data-spatial-shell
      style={{ '--spatial-focus-z': depthLayers.focus } as CSSProperties}
    >
      {children}
    </div>
  );
}
