'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface SplitViewProps {
  readonly primary: ReactNode;
  readonly secondary: ReactNode;
  readonly ratio?: '50-50' | '60-40' | '70-30';
  readonly className?: string;
}

const ratioClass: Record<NonNullable<SplitViewProps['ratio']>, string> = {
  '50-50': 'lg:grid-cols-2',
  '60-40': 'lg:grid-cols-[3fr_2fr]',
  '70-30': 'lg:grid-cols-[7fr_3fr]',
};

export function SplitView({ primary, secondary, ratio = '60-40', className }: SplitViewProps) {
  return (
    <div className={clsx('grid gap-6', ratioClass[ratio], className)}>
      <div className="min-w-0">{primary}</div>
      <div className="min-w-0">{secondary}</div>
    </div>
  );
}
