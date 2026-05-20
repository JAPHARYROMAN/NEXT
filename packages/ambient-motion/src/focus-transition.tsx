'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { focusEmergeVariants, depthTransition } from './ambient-variants';
import { useAmbientMotion } from './use-ambient-motion';

export interface FocusTransitionProps {
  readonly visible: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

export function FocusTransition({ visible, children, className }: FocusTransitionProps) {
  const { variants } = useAmbientMotion(focusEmergeVariants);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key="focus"
          className={className}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={depthTransition}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
