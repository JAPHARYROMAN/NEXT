'use client';

import { FocusTransition } from '@next/ambient-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface ContextualOverlayProps {
  readonly visible: boolean;
  readonly children: ReactNode;
  readonly label?: string;
  readonly lowDistraction?: boolean;
  readonly className?: string;
}

export function ContextualOverlay({
  visible,
  children,
  label = 'Contextual information',
  lowDistraction = false,
  className,
}: ContextualOverlayProps) {
  return (
    <FocusTransition visible={visible}>
      <aside
        className={clsx(
          'pointer-events-auto rounded-2xl border border-white/10 bg-surface/90 p-4 backdrop-blur-md',
          lowDistraction && 'opacity-90 saturate-50',
          className,
        )}
        role="complementary"
        aria-label={label}
        aria-hidden={!visible}
      >
        {children}
      </aside>
    </FocusTransition>
  );
}
