'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { motionSafe, overlayVariants, useReducedMotion } from '@next/animation-system';
import { Badge } from '@next/ui';

export interface LiveCountdownProps {
  readonly startsInSec: number;
  readonly title: string;
  readonly premiere?: boolean;
  readonly className?: string;
}

export function LiveCountdown({ startsInSec, title, premiere, className }: LiveCountdownProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      variants={motionSafe(overlayVariants, reduced)}
      initial="initial"
      animate="animate"
      className={clsx(
        'rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/10 to-transparent p-8',
        className,
      )}
      aria-label="Live countdown"
    >
      {premiere ? (
        <Badge tone="accent" className="mb-3">
          Premiere
        </Badge>
      ) : null}
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-4 font-display text-4xl tabular-nums text-accent" aria-live="polite">
        {formatCountdown(startsInSec)}
      </p>
      <p className="mt-2 text-sm text-muted">Set a reminder — notifications placeholder</p>
    </motion.section>
  );
}

function formatCountdown(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
