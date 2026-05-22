'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { reactionVariants, useReducedMotion, motionSafe } from '@next/animation-system';
import { useInteractionStore, trackReactionPerf } from '@next/frontend-utils';

const symbols = ['✦', '◈', '◇', '○', '◎'] as const;

export interface ReactionBarProps {
  readonly className?: string;
}

export function ReactionBar({ className }: ReactionBarProps) {
  const reduced = useReducedMotion();
  const sendReaction = useInteractionStore((s) => s.sendReaction);
  const pulse = useInteractionStore((s) => s.reactionPulse);

  return (
    <div className={clsx('flex items-center gap-1', className)} role="group" aria-label="Reactions">
      {symbols.map((symbol) => (
        <button
          key={symbol}
          type="button"
          className="rounded-full px-2 py-1 text-sm text-muted transition-colors hover:bg-surface/80 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`React ${symbol}`}
          onClick={() => {
            const t0 = performance.now();
            sendReaction(symbol);
            trackReactionPerf(symbol, Math.round(performance.now() - t0));
          }}
        >
          {symbol}
        </button>
      ))}
      {pulse ? (
        <motion.span
          variants={motionSafe(reactionVariants, reduced)}
          initial="initial"
          animate="animate"
          className="text-xs text-accent"
          aria-live="polite"
        >
          sent
        </motion.span>
      ) : null}
    </div>
  );
}
