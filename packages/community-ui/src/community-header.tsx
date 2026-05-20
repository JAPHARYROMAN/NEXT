'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { presenceVariants, useReducedMotion, motionSafe } from '@next/animation-system';
import { Badge } from '@next/ui';
import type { CommunityMood } from './mood-indicator';

export interface CommunityHeaderProps {
  readonly name: string;
  readonly tagline: string;
  readonly memberCount: string;
  readonly activeNow?: number;
  readonly mood?: CommunityMood;
  readonly accentHue?: number;
  readonly className?: string;
}

export function CommunityHeader({
  name,
  tagline,
  memberCount,
  activeNow,
  mood = 'warm',
  accentHue = 220,
  className,
}: CommunityHeaderProps) {
  const reduced = useReducedMotion();

  return (
    <header
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-subtle/15 p-6 md:p-8',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${accentHue} 40% 12%) 0%, hsl(${accentHue} 30% 8%) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse at 20% 0%, hsl(${accentHue} 60% 40% / 0.25), transparent 60%)`,
        }}
      />
      <div className="relative space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold md:text-3xl">{name}</h1>
          <Badge tone="accent">{mood}</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted md:text-base">{tagline}</p>
        <div className="flex flex-wrap gap-4 text-xs text-subtle">
          <span>{memberCount} members</span>
          {activeNow != null ? (
            <motion.span
              variants={motionSafe(presenceVariants, reduced)}
              initial="initial"
              animate="animate"
              className="text-accent"
            >
              {activeNow} here now
            </motion.span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
