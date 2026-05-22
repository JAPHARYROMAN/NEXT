'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { panelVariants, useReducedMotion } from '@next/animation-system';
import type { ReactNode } from 'react';

export interface FloatingNavSurfaceProps {
  readonly children: ReactNode;
  readonly open?: boolean;
  readonly className?: string;
}

export function FloatingNavSurface({ children, open = true, className }: FloatingNavSurfaceProps) {
  const reduced = useReducedMotion();
  if (!open) return null;

  return (
    <motion.div
      role="toolbar"
      aria-label="Floating navigation"
      className={clsx(
        'fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-subtle/20 bg-surface/95 p-2 shadow-lg backdrop-blur-md',
        className,
      )}
      variants={panelVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: reduced ? 0 : 0.22 }}
    >
      {children}
    </motion.div>
  );
}
