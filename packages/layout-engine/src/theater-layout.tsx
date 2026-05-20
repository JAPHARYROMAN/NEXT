'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface TheaterLayoutProps {
  readonly viewport: ReactNode;
  readonly overlay?: ReactNode;
  readonly rail?: ReactNode;
  readonly className?: string;
}

/** Full-screen theater playback — viewport + optional side rail for couch co-viewing. */
export function TheaterLayout({ viewport, overlay, rail, className }: TheaterLayoutProps) {
  return (
    <div
      className={clsx(
        'relative min-h-screen bg-black',
        rail ? 'grid grid-cols-1 xl:grid-cols-[1fr_22rem]' : '',
        className,
      )}
      data-layout="theater"
    >
      <div className="relative min-h-[70vh] xl:min-h-screen">{viewport}</div>
      {overlay ? <div className="pointer-events-none absolute inset-0 z-20">{overlay}</div> : null}
      {rail ? (
        <aside className="hidden border-l border-white/10 bg-bg/95 p-6 xl:block">{rail}</aside>
      ) : null}
    </div>
  );
}
