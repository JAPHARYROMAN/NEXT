'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface TvLayoutProps {
  readonly hero: ReactNode;
  readonly shelves: ReactNode;
  readonly ambient?: ReactNode;
  readonly className?: string;
}

/** 10-foot theater home — hero dominates, shelves breathe below. */
export function TvLayout({ hero, shelves, ambient, className }: TvLayoutProps) {
  return (
    <div
      className={clsx(
        'relative min-h-screen overflow-x-hidden bg-bg text-fg',
        'tv:text-xl tv:leading-relaxed',
        className,
      )}
      data-layout="tv"
    >
      {ambient ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {ambient}
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-[var(--tv-max-width,1680px)] px-8 pb-16 pt-10 tv:px-12 tv:pt-14">
        <header className="mb-10">{hero}</header>
        <main className="space-y-14">{shelves}</main>
      </div>
    </div>
  );
}
