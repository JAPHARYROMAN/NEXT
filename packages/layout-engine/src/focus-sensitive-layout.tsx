'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useFocusLayoutStore } from '@next/frontend-utils';

export interface FocusRegion {
  readonly id: string;
  readonly content: ReactNode;
  readonly span?: 1 | 2;
}

export interface FocusSensitiveLayoutProps {
  readonly regions: readonly FocusRegion[];
  readonly className?: string;
}

export function FocusSensitiveLayout({ regions, className }: FocusSensitiveLayoutProps) {
  const focusId = useFocusLayoutStore((s) => s.focusRegionId);

  return (
    <div
      className={clsx(
        'grid gap-6 transition-all duration-500',
        'md:grid-cols-2 xl:grid-cols-3',
        className,
      )}
      data-layout="focus-sensitive"
    >
      {regions.map((region) => {
        const focused = focusId === region.id || focusId === 'global';
        return (
          <div
            key={region.id}
            className={clsx(
              'rounded-2xl border border-white/10 p-6 transition-all duration-500',
              focused ? 'col-span-full md:col-span-2 bg-elevated' : 'bg-surface/50 opacity-80',
              region.span === 2 && focused && 'xl:col-span-2',
            )}
            data-focus-region={region.id}
            aria-hidden={!focused && focusId !== 'global'}
          >
            {region.content}
          </div>
        );
      })}
    </div>
  );
}
