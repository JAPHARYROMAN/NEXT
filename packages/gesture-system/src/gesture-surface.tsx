'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useSwipe, type SwipeDirection } from './use-swipe';

export interface GestureSurfaceProps {
  readonly children: ReactNode;
  readonly onSwipe?: (direction: SwipeDirection) => void;
  readonly className?: string;
  readonly label?: string;
}

export function GestureSurface({ children, onSwipe, className, label }: GestureSurfaceProps) {
  const swipe = useSwipe({
    axis: 'horizontal',
    ...(onSwipe ? { onSwipe } : {}),
  });

  return (
    <div
      className={clsx('touch-pan-y', className)}
      role="region"
      aria-label={label ?? 'Gesture surface'}
      {...swipe}
    >
      {children}
    </div>
  );
}
