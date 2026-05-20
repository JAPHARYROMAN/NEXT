'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { motionSafe, presenceVariants, useReducedMotion } from '@next/animation-system';

export interface PresenceIndicatorProps {
  readonly count: number;
  readonly label?: string;
  readonly className?: string;
}

export function PresenceIndicator({
  count,
  label = 'watching',
  className,
}: PresenceIndicatorProps) {
  const reduced = useReducedMotion();

  return (
    <div className={clsx('flex items-center gap-2 text-sm', className)} aria-live="polite">
      <motion.span
        variants={motionSafe(presenceVariants, reduced)}
        animate="animate"
        className="inline-block h-2 w-2 rounded-full bg-accent"
        aria-hidden
      />
      <span className="tabular-nums font-medium">{count.toLocaleString()}</span>
      <span className="text-muted">{label}</span>
    </div>
  );
}
