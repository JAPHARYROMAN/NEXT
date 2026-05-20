'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { theaterAmbientVariants, motionSafe, useReducedMotion } from '@next/animation-system';

export interface AmbientTheaterOverlayProps {
  readonly hue?: number;
  readonly className?: string;
}

export function AmbientTheaterOverlay({ hue = 220, className }: AmbientTheaterOverlayProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      variants={motionSafe(theaterAmbientVariants, reduced)}
      initial="initial"
      animate="animate"
      transition={{ duration: reduced ? 0 : 8, repeat: Infinity, repeatType: 'reverse' }}
      className={clsx('absolute inset-0', className)}
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 100%, hsl(${hue} 45% 18% / 0.5), transparent 70%)`,
      }}
    />
  );
}
