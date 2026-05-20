'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { FocusProvider } from './focus-context';

export interface FocusZoneProps {
  readonly children: ReactNode;
  readonly zone: string;
  readonly defaultFocusId?: string;
  readonly className?: string;
  readonly label?: string;
}

/** Isolated spatial focus region — shelves, rails, overlays. */
export function FocusZone({ children, zone, defaultFocusId, className, label }: FocusZoneProps) {
  return (
    <section className={clsx('relative', className)} aria-label={label ?? zone}>
      <FocusProvider zone={zone} {...(defaultFocusId ? { defaultFocusId } : {})}>
        {children}
      </FocusProvider>
    </section>
  );
}
