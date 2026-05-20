'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface CinematicViewportProps {
  readonly viewport: ReactNode;
  readonly chrome?: ReactNode;
  readonly aspect?: '16/9' | '21/9' | 'cinematic';
  readonly className?: string;
}

const aspectClass: Record<NonNullable<CinematicViewportProps['aspect']>, string> = {
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
  cinematic: 'min-h-[70vh]',
};

export function CinematicViewport({
  viewport,
  chrome,
  aspect = 'cinematic',
  className,
}: CinematicViewportProps) {
  return (
    <div className={clsx('relative w-full', className)} data-layout="cinematic-viewport">
      <div className={clsx('relative overflow-hidden rounded-2xl', aspectClass[aspect])}>
        {viewport}
      </div>
      {chrome ? (
        <div className="mt-6 px-2 tv:px-4 projector:max-w-[90vw] projector:mx-auto">{chrome}</div>
      ) : null}
    </div>
  );
}
