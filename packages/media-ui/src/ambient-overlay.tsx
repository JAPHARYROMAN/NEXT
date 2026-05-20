'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';

export interface AmbientOverlayProps {
  readonly hue?: number;
  readonly intensity?: number;
  readonly className?: string;
}

export function AmbientOverlay({ hue = 220, intensity = 0.25, className }: AmbientOverlayProps) {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      className={clsx('pointer-events-none absolute inset-0', className)}
      aria-hidden
      animate={{
        opacity: [intensity * 0.6, intensity, intensity * 0.7],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(${hue} 70% 45% / ${intensity}), transparent 70%)`,
      }}
    />
  );
}
