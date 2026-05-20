'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { FocusProvider, RemoteShortcuts } from '@next/remote-navigation';
import { useRenderTelemetry } from '@next/frontend-utils';

export interface TheaterShellProps {
  readonly children: ReactNode;
  readonly onBack?: () => void;
  readonly onHome?: () => void;
  readonly className?: string;
}

export function TheaterShell({ children, onBack, onHome, className }: TheaterShellProps) {
  useRenderTelemetry('TheaterShell');

  return (
    <div
      className={clsx(
        'theater-root min-h-screen bg-bg text-fg antialiased',
        'tv:text-[1.125rem] tv:tracking-wide',
        className,
      )}
    >
      <RemoteShortcuts {...(onBack ? { onBack } : {})} {...(onHome ? { onHome } : {})} />
      <FocusProvider>{children}</FocusProvider>
    </div>
  );
}
