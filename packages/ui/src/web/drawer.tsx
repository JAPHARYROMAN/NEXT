'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  drawerVariants,
  motionSafe,
  pageTransition,
  useReducedMotion,
} from '@next/animation-system';

export interface DrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly side?: 'right' | 'left';
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(drawerVariants, reduced);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            aria-label="Close panel"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={clsx(
              'absolute top-0 h-full w-full max-w-md bg-surface shadow-cinematic',
              side === 'right' ? 'right-0' : 'left-0',
            )}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduced ? { duration: 0 } : pageTransition}
          >
            <header className="flex items-center justify-between border-b border-subtle/15 px-5 py-4">
              <h2 className="text-base font-semibold">{title}</h2>
              <button type="button" className="text-muted hover:text-fg" onClick={onClose}>
                Close
              </button>
            </header>
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
