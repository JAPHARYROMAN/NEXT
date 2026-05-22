'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { chaosDriftVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Badge, Surface } from '@next/ui';

export interface ChaosEntryProps {
  readonly href?: string;
  readonly onEnter?: () => void;
  readonly className?: string;
}

export function ChaosEntry({ href = '/chaos', onEnter, className }: ChaosEntryProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={motionSafe(chaosDriftVariants, reduced)}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className={className}
    >
      <Link href={href} {...(onEnter ? { onClick: onEnter } : {})}>
        <Surface
          bordered
          className="group relative overflow-hidden p-6 transition-transform hover:scale-[1.01]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 20% 80%, hsl(280 60% 40%), transparent 50%), radial-gradient(circle at 80% 20%, hsl(130 50% 30%), transparent 50%)',
            }}
            aria-hidden
          />
          <div className="relative space-y-2">
            <Badge tone="accent">Chaos hour</Badge>
            <h2 className="font-display text-2xl font-semibold">Enter the unexpected</h2>
            <p className="max-w-md text-sm text-muted">
              Underground creators, niche live, experimental media — playful discovery without
              engagement traps.
            </p>
            <span className="inline-block text-sm text-accent group-hover:underline">
              Step in →
            </span>
          </div>
        </Surface>
      </Link>
    </motion.div>
  );
}
