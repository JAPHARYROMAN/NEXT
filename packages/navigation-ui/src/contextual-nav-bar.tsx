'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMobileNavigationStore } from '@next/frontend-utils';

export interface ContextualNavBarProps {
  readonly title: string;
  readonly actions?: ReactNode;
  readonly backHref?: string;
  readonly className?: string;
}

export function ContextualNavBar({ title, actions, className }: ContextualNavBarProps) {
  const setState = useMobileNavigationStore((s) => s.setState);

  return (
    <div
      className={clsx('flex min-h-[48px] items-center justify-between gap-3 px-4 py-2', className)}
    >
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] rounded-lg px-2 text-sm text-muted"
        onClick={() => setState('standard')}
        aria-label="Show navigation"
      >
        ←
      </button>
      <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}
