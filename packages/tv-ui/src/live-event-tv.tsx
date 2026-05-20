'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { overlayVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Focusable } from '@next/remote-navigation';
import { Badge } from '@next/ui';
import { useTvSessionStore } from '@next/frontend-utils';

export interface LiveEventTvProps {
  readonly eventId: string;
  readonly title: string;
  readonly startsInSec: number;
  readonly audienceLabel: string;
  readonly highlights?: readonly string[];
  readonly onJoin?: () => void;
  readonly className?: string;
}

export function LiveEventTv({
  eventId,
  title,
  startsInSec,
  audienceLabel,
  highlights = [],
  onJoin,
  className,
}: LiveEventTvProps) {
  const reduced = useReducedMotion();
  useTvSessionStore.getState().setLiveEventId(eventId);

  return (
    <motion.section
      variants={motionSafe(overlayVariants, reduced)}
      initial="initial"
      animate="animate"
      className={clsx(
        'relative min-h-[50vh] rounded-3xl border border-accent/20 bg-gradient-to-b from-accent/10 to-bg p-10',
        className,
      )}
      aria-label="Live event"
    >
      <Badge tone="accent" className="mb-4">
        Live soon
      </Badge>
      <h2 className="font-display text-4xl font-semibold tv:text-5xl">{title}</h2>
      <p className="mt-4 text-2xl tabular-nums text-accent" aria-live="polite">
        {formatCountdown(startsInSec)}
      </p>
      <p className="mt-2 text-lg text-muted">{audienceLabel}</p>
      {highlights.length > 0 ? (
        <ul className="mt-6 space-y-2 text-muted">
          {highlights.map((h) => (
            <li key={h}>· {h}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-8">
        <Focusable focusId="live-join" row={0} col={0} onClick={onJoin}>
          Enter live stage
        </Focusable>
      </div>
    </motion.section>
  );
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
