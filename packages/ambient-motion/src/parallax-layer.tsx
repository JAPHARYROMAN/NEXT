'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useAmbientMotion } from './use-ambient-motion';
import { parallaxLayerVariants } from './ambient-variants';

export interface ParallaxLayerProps {
  readonly children: ReactNode;
  readonly depth?: 'near' | 'mid' | 'far';
  readonly className?: string;
}

export function ParallaxLayer({ children, depth = 'mid', className }: ParallaxLayerProps) {
  const { variants, parallaxOffset, reduced } = useAmbientMotion(parallaxLayerVariants, {
    parallaxDepth: depth,
  });

  const motionStyle = reduced ? {} : { translateY: -parallaxOffset };

  return (
    <motion.div
      className={clsx('will-change-transform', className)}
      variants={variants}
      animate={depth}
      style={motionStyle}
      data-parallax-depth={depth}
    >
      {children}
    </motion.div>
  );
}
