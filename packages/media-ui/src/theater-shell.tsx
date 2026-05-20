'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { PlayerShell } from '@next/ui';

export interface TheaterShellProps {
  readonly title: string;
  readonly children?: ReactNode;
  readonly mode?: 'default' | 'theater' | 'fullscreen';
  readonly className?: string;
}

export function TheaterShell({ title, children, mode = 'theater', className }: TheaterShellProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={clsx(
        'overflow-hidden rounded-2xl border border-subtle/15 bg-black/90',
        mode === 'fullscreen' && 'fixed inset-0 z-50 rounded-none',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.4 }}
      role="region"
      aria-label={`Theater: ${title}`}
    >
      <PlayerShell title={title} mode={mode === 'theater' ? 'theater' : 'mini'} />
      {children ?? (
        <div className="flex aspect-video items-center justify-center border-t border-subtle/10 text-sm text-muted">
          Preview surface — media pipeline pending
        </div>
      )}
    </motion.div>
  );
}
