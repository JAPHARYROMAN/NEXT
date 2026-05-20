'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { motionSafe, presenceVariants, useReducedMotion } from '@next/animation-system';

export interface ActivityPulseProps {
  readonly label: string;
  readonly intensity?: 'low' | 'medium' | 'high';
  readonly className?: string;
}

export function ActivityPulse({ label, intensity = 'medium', className }: ActivityPulseProps) {
  const reduced = useReducedMotion();
  const opacity = intensity === 'low' ? 0.4 : intensity === 'medium' ? 0.65 : 1;

  return (
    <div className={clsx('flex items-center gap-2 text-xs text-muted', className)}>
      <motion.span
        variants={motionSafe(presenceVariants, reduced)}
        animate="animate"
        className="h-1.5 w-8 rounded-full bg-accent/60"
        style={{ opacity }}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
