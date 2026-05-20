'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useReducedMotion, playerVariants } from '@next/animation-system';
import { IconPlay } from '@next/icons';

export interface MiniPlayerProps {
  readonly title: string;
  readonly onExpand?: () => void;
  readonly className?: string;
}

export function MiniPlayer({ title, onExpand, className }: MiniPlayerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={clsx(
        'flex h-14 items-center gap-3 overflow-hidden rounded-xl border border-subtle/15 bg-black/95 px-3',
        className,
      )}
      variants={playerVariants}
      initial="mini"
      animate="mini"
      transition={{ duration: reduced ? 0 : 0.25 }}
      role="region"
      aria-label={`Mini player: ${title}`}
    >
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"
        aria-label="Resume playback"
      >
        <IconPlay size={16} aria-hidden />
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-white"
        onClick={onExpand}
      >
        {title}
      </button>
    </motion.div>
  );
}
