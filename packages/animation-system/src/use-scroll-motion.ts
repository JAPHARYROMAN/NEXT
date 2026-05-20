'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

export interface ScrollMotionState {
  readonly progress: number;
  readonly direction: 'up' | 'down' | 'idle';
}

/** Scroll-linked motion progress (0–1) for parallax and reveal effects. */
export function useScrollMotion(threshold = 120): ScrollMotionState {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | 'idle'>('idle');

  useEffect(() => {
    if (reduced) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setDirection(y > lastY ? 'down' : y < lastY ? 'up' : 'idle');
      lastY = y;
      setProgress(Math.min(1, y / threshold));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced, threshold]);

  return { progress: reduced ? 0 : progress, direction };
}
