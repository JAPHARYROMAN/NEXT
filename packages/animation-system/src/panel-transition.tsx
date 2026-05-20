'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotion } from './use-reduced-motion';
import { panelVariants, motionSafe } from './variants';

export interface PanelTransitionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export function PanelTransition({ children, className, delay = 0 }: PanelTransitionProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(panelVariants, reduced);

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
