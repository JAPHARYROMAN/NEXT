'use client';

import { useCallback, useRef, type TouchEvent } from 'react';
import { trackGestureLatency } from '@next/frontend-utils';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeHandlers {
  readonly onSwipe?: (direction: SwipeDirection) => void;
  readonly thresholdPx?: number;
  readonly axis?: 'horizontal' | 'vertical' | 'both';
}

const DEFAULT_THRESHOLD = 48;

export function useSwipe({
  onSwipe,
  thresholdPx = DEFAULT_THRESHOLD,
  axis = 'both',
}: SwipeHandlers) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    start.current = { x: t.clientX, y: t.clientY, t: performance.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin || !onSwipe) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - origin.x;
      const dy = t.clientY - origin.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) < thresholdPx) return;

      let direction: SwipeDirection | null = null;
      if (absX >= absY && (axis === 'horizontal' || axis === 'both')) {
        direction = dx > 0 ? 'right' : 'left';
      } else if (absY > absX && (axis === 'vertical' || axis === 'both')) {
        direction = dy > 0 ? 'down' : 'up';
      }
      if (!direction) return;
      trackGestureLatency('swipe', direction, Math.round(performance.now() - origin.t));
      onSwipe(direction);
    },
    [axis, onSwipe, thresholdPx],
  );

  return { onTouchStart, onTouchEnd };
}
