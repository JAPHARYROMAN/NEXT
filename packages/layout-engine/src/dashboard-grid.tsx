'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface DashboardGridProps {
  readonly children: ReactNode;
  readonly columns?: 2 | 3 | 4;
  readonly className?: string;
}

const colClass: Record<NonNullable<DashboardGridProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

export function DashboardGrid({ children, columns = 3, className }: DashboardGridProps) {
  return (
    <div className={clsx('grid auto-rows-fr gap-4', colClass[columns], className)}>{children}</div>
  );
}
