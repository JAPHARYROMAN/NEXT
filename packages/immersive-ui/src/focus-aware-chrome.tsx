'use client';

import { FocusTransition } from '@next/ambient-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useFocusLayoutStore } from '@next/frontend-utils';

export interface FocusAwareChromeProps {
  readonly children: ReactNode;
  readonly regionId: string;
  readonly className?: string;
}

export function FocusAwareChrome({ children, regionId, className }: FocusAwareChromeProps) {
  const focusId = useFocusLayoutStore((s) => s.focusRegionId);
  const visible = focusId === regionId || focusId === 'global';

  return (
    <FocusTransition visible={visible}>
      <header
        className={clsx(
          'flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4',
          className,
        )}
        data-focus-region={regionId}
      >
        {children}
      </header>
    </FocusTransition>
  );
}
