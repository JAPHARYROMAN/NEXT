'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { discoveryRevealVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Surface, Badge } from '@next/ui';

export interface TrendWave {
  readonly id: string;
  readonly label: string;
  readonly movement: string;
  readonly whyRising: string;
  readonly region?: string;
  readonly velocity?: number;
}

export interface TrendWaveCardProps {
  readonly wave: TrendWave;
  readonly active?: boolean;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function TrendWaveCard({ wave, active, onSelect, className }: TrendWaveCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      variants={motionSafe(discoveryRevealVariants, reduced)}
      initial="initial"
      animate="animate"
      className={clsx('w-full text-left', className)}
      onClick={() => onSelect?.(wave.id)}
      aria-pressed={active}
    >
      <Surface
        bordered
        className={clsx(
          'p-4 transition-colors',
          active ? 'border-accent/40 bg-accent/5' : 'hover:border-subtle/30',
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-medium">{wave.label}</span>
          {wave.region ? <Badge tone="neutral">{wave.region}</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-muted">{wave.movement}</p>
        <p className="mt-3 text-xs text-subtle">{wave.whyRising}</p>
      </Surface>
    </motion.button>
  );
}
