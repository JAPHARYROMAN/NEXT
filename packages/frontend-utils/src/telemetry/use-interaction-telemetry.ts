'use client';

import { useCallback, useRef } from 'react';
import { trackInteraction } from './index';

/** Wrap handlers to record interaction latency (click/tap). */
export function useInteractionTelemetry(action: string, target: string) {
  const started = useRef(0);

  const wrap = useCallback(
    <T extends (...args: never[]) => void>(handler: T): T => {
      const wrapped = ((...args: Parameters<T>) => {
        started.current = performance.now();
        handler(...args);
        trackInteraction(action, target, Math.round(performance.now() - started.current));
      }) as T;
      return wrapped;
    },
    [action, target],
  );

  return wrap;
}
