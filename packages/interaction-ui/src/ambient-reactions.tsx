'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useReducedMotion, overlayVariants, motionSafe } from '@next/animation-system';
import { useInteractionStore } from '@next/frontend-utils';

const reactions = ['✦', '◈', '◇', '○'] as const;

export interface AmbientReactionsProps {
  readonly className?: string;
}

export function AmbientReactions({ className }: AmbientReactionsProps) {
  const reduced = useReducedMotion();
  const pulse = useInteractionStore((s) => s.reactionPulse);
  const sendReaction = useInteractionStore((s) => s.sendReaction);

  return (
    <div
      className={clsx('flex items-center gap-1', className)}
      role="group"
      aria-label="Ambient reactions"
    >
      {reactions.map((symbol) => (
        <button
          key={symbol}
          type="button"
          className="rounded-full px-2 py-1 text-sm text-muted transition-colors hover:bg-surface/80 hover:text-foreground"
          aria-label={`React ${symbol}`}
          onClick={() => sendReaction(symbol)}
        >
          {symbol}
        </button>
      ))}
      {pulse ? (
        <motion.span
          className="text-xs text-accent"
          variants={motionSafe(overlayVariants, reduced)}
          initial="initial"
          animate="animate"
          aria-live="polite"
        >
          sent
        </motion.span>
      ) : null}
    </div>
  );
}
