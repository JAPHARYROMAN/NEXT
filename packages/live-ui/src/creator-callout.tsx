'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { overlayVariants, useReducedMotion, motionSafe } from '@next/animation-system';

export interface CreatorCalloutProps {
  readonly creatorName: string;
  readonly message: string;
  readonly className?: string;
}

export function CreatorCallout({ creatorName, message, className }: CreatorCalloutProps) {
  const reduced = useReducedMotion();

  return (
    <motion.aside
      className={clsx('rounded-xl border border-brand/30 bg-brand/10 p-4', className)}
      variants={motionSafe(overlayVariants, reduced)}
      initial="initial"
      animate="animate"
      aria-label={`Creator callout from ${creatorName}`}
    >
      <p className="text-xs font-medium text-brand">{creatorName}</p>
      <p className="mt-1 text-sm">{message}</p>
    </motion.aside>
  );
}
