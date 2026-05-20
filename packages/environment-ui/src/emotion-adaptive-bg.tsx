'use client';

import clsx from 'clsx';
import { applyAmbientLighting } from '@next/theme-system';
import { useEffect, useRef } from 'react';
import type { CinematicGradient } from '@next/theme-system';

export interface EmotionAdaptiveBgProps {
  readonly gradient?: CinematicGradient;
  readonly className?: string;
}

const emotionGradient: Record<string, CinematicGradient> = {
  calm: 'depth',
  curious: 'aurora',
  intense: 'ember',
  social: 'studio',
};

export function EmotionAdaptiveBg({ gradient = 'depth', className }: EmotionAdaptiveBgProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    applyAmbientLighting(el, gradient);
    return () => {
      el.removeAttribute('data-ambient');
      el.style.removeProperty('--next-ambient-gradient');
    };
  }, [gradient]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={clsx('pointer-events-none absolute inset-0 opacity-50', className)}
      style={{
        background: 'var(--next-ambient-gradient, transparent)',
      }}
      data-emotion-gradient={gradient}
    />
  );
}

export { emotionGradient };
