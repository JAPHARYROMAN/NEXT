'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export type MixedResultDensity = 'compact' | 'comfortable' | 'immersive';

export interface MixedResultsLayoutProps {
  readonly primary: ReactNode;
  readonly secondary?: ReactNode;
  readonly density?: MixedResultDensity;
  readonly className?: string;
}

const densityClass: Record<MixedResultDensity, string> = {
  compact: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
  comfortable: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  immersive: 'grid gap-8 lg:grid-cols-2',
};

export function MixedResultsLayout({
  primary,
  secondary,
  density = 'comfortable',
  className,
}: MixedResultsLayoutProps) {
  return (
    <div className={clsx('space-y-8', className)}>
      <div className={densityClass[density]} role="list">
        {primary}
      </div>
      {secondary ? (
        <aside className="border-t border-subtle/10 pt-8" aria-label="Related results">
          {secondary}
        </aside>
      ) : null}
    </div>
  );
}
