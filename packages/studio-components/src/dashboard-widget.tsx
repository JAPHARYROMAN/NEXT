'use client';

import { PanelTransition } from '@next/animation-system';
import { Surface } from '@next/ui';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface DashboardWidgetProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly span?: 'single' | 'wide' | 'tall';
  readonly className?: string;
}

const spanClass: Record<NonNullable<DashboardWidgetProps['span']>, string> = {
  single: '',
  wide: 'md:col-span-2',
  tall: 'md:row-span-2',
};

export function DashboardWidget({
  title,
  description,
  children,
  span = 'single',
  className,
}: DashboardWidgetProps) {
  return (
    <PanelTransition className={clsx(spanClass[span], className)}>
      <Surface bordered elevation="e2" className="flex h-full flex-col p-5">
        <header className="mb-4">
          <h2 className="text-sm font-medium">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
        </header>
        <div className="min-h-0 flex-1">{children}</div>
      </Surface>
    </PanelTransition>
  );
}
