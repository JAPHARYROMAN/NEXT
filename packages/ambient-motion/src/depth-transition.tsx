'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { depthEnterVariants, depthTransition } from './ambient-variants';
import { useAmbientMotion } from './use-ambient-motion';

export interface DepthTransitionProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DepthTransition({ children, className }: DepthTransitionProps) {
  const { variants } = useAmbientMotion(depthEnterVariants);

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={depthTransition}
    >
      {children}
    </motion.div>
  );
}
