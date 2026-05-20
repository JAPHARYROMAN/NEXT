import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export interface GridZoneProps extends HTMLAttributes<HTMLDivElement> {
  readonly columns?: 1 | 2 | 3 | 4;
  readonly children: ReactNode;
}

const colClass: Record<NonNullable<GridZoneProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
};

export function GridZone({ columns = 3, className, children, ...rest }: GridZoneProps) {
  return (
    <div className={clsx('grid gap-4 md:gap-6', colClass[columns], className)} {...rest}>
      {children}
    </div>
  );
}
