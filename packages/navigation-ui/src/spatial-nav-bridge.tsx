'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { DepthNav, type DepthNavItem } from '@next/spatial-ui';

export interface SpatialNavBridgeProps {
  readonly items: readonly DepthNavItem[];
  readonly trailing?: ReactNode;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

/** Bridges classic navigation-ui surfaces with spatial depth nav */
export function SpatialNavBridge({ items, trailing, onSelect, className }: SpatialNavBridgeProps) {
  return (
    <div className={clsx('flex flex-col gap-6 lg:flex-row lg:items-start', className)}>
      <DepthNav items={items} {...(onSelect ? { onSelect } : {})} />
      {trailing ? <div className="flex-1">{trailing}</div> : null}
    </div>
  );
}
