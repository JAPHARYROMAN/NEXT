'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface CalmSurfaceProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly className?: string;
}

/** Low-attention intelligence surface — appears calm, never shouty */
export function CalmSurface({ children, title, className }: CalmSurfaceProps) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-white/5 bg-elevated/60 p-4 text-sm text-muted',
        className,
      )}
      data-surface="calm"
    >
      {title ? (
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}
