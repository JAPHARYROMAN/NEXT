'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeVariants, motionSafe, pageTransition } from './variants';
import { useReducedMotion } from './use-reduced-motion';

export interface PageTransitionProps {
  readonly routeKey: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function PageTransition({ routeKey, children, className }: PageTransitionProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(fadeVariants, reduced);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={reduced ? { duration: 0 } : pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
