'use client';

import { useCallback, useRef } from 'react';
import { trackGestureLatency } from '@next/frontend-utils';

export interface LongPressOptions {
  readonly onLongPress?: () => void;
  readonly durationMs?: number;
}

export function useLongPress({ onLongPress, durationMs = 500 }: LongPressOptions) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef(0);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const onTouchStart = useCallback(() => {
    clear();
    startTime.current = performance.now();
    timer.current = setTimeout(() => {
      if (onLongPress) {
        trackGestureLatency(
          'long_press',
          'surface',
          Math.round(performance.now() - startTime.current),
        );
        onLongPress();
      }
    }, durationMs);
  }, [clear, durationMs, onLongPress]);

  const onTouchEnd = useCallback(() => clear(), [clear]);
  const onTouchCancel = useCallback(() => clear(), [clear]);

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
