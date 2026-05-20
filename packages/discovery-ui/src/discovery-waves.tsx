'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { panelVariants, motionSafe, useReducedMotion } from '@next/animation-system';

export interface DiscoveryWave {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface DiscoveryWavesProps {
  readonly waves: readonly DiscoveryWave[];
  readonly activeId?: string;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function DiscoveryWaves({ waves, activeId, onSelect, className }: DiscoveryWavesProps) {
  const reduced = useReducedMotion();

  return (
    <nav className={clsx('flex flex-col gap-2', className)} aria-label="Discovery waves">
      {waves.map((wave) => (
        <motion.button
          key={wave.id}
          type="button"
          variants={motionSafe(panelVariants, reduced)}
          initial="initial"
          animate="animate"
          className={clsx(
            'rounded-xl border px-4 py-3 text-left transition-colors',
            activeId === wave.id
              ? 'border-accent/40 bg-accent/5'
              : 'border-subtle/15 hover:border-subtle/30',
          )}
          onClick={() => onSelect?.(wave.id)}
          aria-current={activeId === wave.id ? 'true' : undefined}
        >
          <span className="font-medium">{wave.label}</span>
          <p className="mt-1 text-xs text-muted">{wave.description}</p>
        </motion.button>
      ))}
    </nav>
  );
}
