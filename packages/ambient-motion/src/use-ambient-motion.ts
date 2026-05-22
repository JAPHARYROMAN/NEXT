'use client';

import { useReducedMotion } from '@next/animation-system';
import { motionSafe } from '@next/animation-system';
import type { Variants } from 'framer-motion';
import { useMemo } from 'react';

export interface AmbientMotionOptions {
  readonly parallaxDepth?: 'near' | 'mid' | 'far';
  readonly disableParallax?: boolean;
}

export function useAmbientMotion(variants: Variants, options?: AmbientMotionOptions) {
  const reduced = useReducedMotion();
  const safe = useMemo(() => motionSafe(variants, reduced), [variants, reduced]);

  const parallaxOffset = useMemo(() => {
    if (reduced || options?.disableParallax) return 0;
    const map = { near: 0, mid: 8, far: 16 } as const;
    return map[options?.parallaxDepth ?? 'mid'];
  }, [reduced, options?.disableParallax, options?.parallaxDepth]);

  return { variants: safe, reduced, parallaxOffset };
}
