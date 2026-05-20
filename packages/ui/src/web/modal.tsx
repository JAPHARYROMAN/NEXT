'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import { focusRing } from '@next/design-system';
import {
  modalVariants,
  motionSafe,
  pageTransition,
  useReducedMotion,
} from '@next/animation-system';

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(modalVariants, reduced);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={clsx(
              'relative z-10 w-full max-w-lg rounded-xl bg-surface p-6 shadow-cinematic',
              focusRing,
              className,
            )}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduced ? { duration: 0 } : pageTransition}
          >
            <h2 id="modal-title" className="text-lg font-semibold text-fg">
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
