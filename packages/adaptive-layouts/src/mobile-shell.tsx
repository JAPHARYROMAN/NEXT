'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useViewport } from '@next/responsive-engine';

export interface MobileShellProps {
  readonly header?: ReactNode;
  readonly nav?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly immersive?: boolean;
}

export function MobileShell({ header, nav, children, className, immersive }: MobileShellProps) {
  const { device, orientation } = useViewport();
  const isSplit = device === 'foldable' && orientation === 'landscape';

  return (
    <div
      className={clsx('flex min-h-dvh flex-col bg-bg', immersive && 'overflow-hidden', className)}
      data-device={device}
      data-orientation={orientation}
    >
      {header && !immersive ? (
        <header className="sticky top-0 z-30 shrink-0 border-b border-subtle/15 bg-surface/90 backdrop-blur-md">
          {header}
        </header>
      ) : null}
      <div className={clsx('flex min-h-0 flex-1', isSplit && 'flex-row')}>
        <main
          className={clsx(
            'min-w-0 flex-1 overflow-y-auto overscroll-contain',
            immersive && 'overflow-hidden',
            nav && 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
          )}
          id="mobile-main"
        >
          {children}
        </main>
        {isSplit ? (
          <aside
            className="hidden w-80 shrink-0 border-l border-subtle/15 md:block"
            aria-label="Secondary panel"
          />
        ) : null}
      </div>
      {nav}
    </div>
  );
}
