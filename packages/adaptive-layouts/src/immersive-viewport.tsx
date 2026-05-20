'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface ImmersiveViewportProps {
  readonly children: ReactNode;
  readonly overlay?: ReactNode;
  readonly className?: string;
}

/** Full-bleed vertical media viewport for shorts and immersive feed items. */
export function ImmersiveViewport({ children, overlay, className }: ImmersiveViewportProps) {
  return (
    <section
      className={clsx(
        'relative flex h-[100dvh] w-full snap-start snap-always flex-col bg-black',
        className,
      )}
      aria-label="Immersive media viewport"
    >
      <div className="absolute inset-0">{children}</div>
      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto">{overlay}</div>
        </div>
      ) : null}
    </section>
  );
}
