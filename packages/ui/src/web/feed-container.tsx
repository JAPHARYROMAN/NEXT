'use client';

import type { ReactNode } from 'react';
import { GridZone } from '@next/layout-engine';

export interface FeedContainerProps {
  readonly title?: string;
  readonly children: ReactNode;
  readonly columns?: 1 | 2 | 3 | 4;
}

export function FeedContainer({ title, children, columns = 3 }: FeedContainerProps) {
  return (
    <section aria-label={title ?? 'Feed'} className="space-y-6">
      {title ? (
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      ) : null}
      <GridZone columns={columns}>{children}</GridZone>
    </section>
  );
}
