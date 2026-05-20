'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useSwipe } from './use-swipe';

export interface SwipeFeedProps {
  readonly items: readonly ReactNode[];
  readonly index: number;
  readonly onIndexChange: (index: number) => void;
  readonly className?: string;
}

/** Vertical swipe between full-viewport feed items. */
export function SwipeFeed({ items, index, onIndexChange, className }: SwipeFeedProps) {
  const swipe = useSwipe({
    axis: 'vertical',
    thresholdPx: 56,
    onSwipe: (dir) => {
      if (dir === 'up' && index < items.length - 1) onIndexChange(index + 1);
      if (dir === 'down' && index > 0) onIndexChange(index - 1);
    },
  });

  return (
    <div
      className={clsx('relative h-[100dvh] w-full overflow-hidden', className)}
      aria-label="Swipe feed"
      aria-live="polite"
      {...swipe}
    >
      <div
        className="flex h-full flex-col transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateY(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <div key={i} className="h-[100dvh] w-full shrink-0 snap-start">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
