'use client';

import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { overlayVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { useTvSessionStore } from '@next/frontend-utils';

export interface MetadataOverlayProps {
  readonly title: string;
  readonly creator: string;
  readonly synopsis?: string;
  readonly className?: string;
}

export function MetadataOverlay({ title, creator, synopsis, className }: MetadataOverlayProps) {
  const overlay = useTvSessionStore((s) => s.playbackOverlay);
  const reduced = useReducedMotion();
  const open = overlay === 'metadata';

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          variants={motionSafe(overlayVariants, reduced)}
          initial="initial"
          animate="animate"
          exit="exit"
          className={clsx(
            'pointer-events-auto max-w-md rounded-2xl bg-black/70 p-8 text-lg backdrop-blur-lg',
            className,
          )}
          aria-label="Media metadata"
        >
          <h2 className="font-display text-3xl font-semibold">{title}</h2>
          <p className="mt-2 text-accent">{creator}</p>
          {synopsis ? <p className="mt-4 text-muted leading-relaxed">{synopsis}</p> : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
