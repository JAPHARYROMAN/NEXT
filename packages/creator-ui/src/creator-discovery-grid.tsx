'use client';

import clsx from 'clsx';
import { CreatorCard } from '@next/ui';
import { motion } from 'framer-motion';
import { constellationVariants, motionSafe, useReducedMotion } from '@next/animation-system';

export interface DiscoveryCreator {
  readonly handle: string;
  readonly name: string;
  readonly bio?: string;
  readonly href: string;
  readonly niche?: string;
  readonly live?: boolean;
}

export interface CreatorDiscoveryGridProps {
  readonly creators: readonly DiscoveryCreator[];
  readonly view?: 'grid' | 'constellation';
  readonly className?: string;
}

export function CreatorDiscoveryGrid({
  creators,
  view = 'grid',
  className,
}: CreatorDiscoveryGridProps) {
  const reduced = useReducedMotion();

  if (view === 'constellation') {
    return (
      <div
        className={clsx('flex flex-wrap justify-center gap-6', className)}
        aria-label="Creator constellation"
      >
        {creators.map((c, i) => (
          <motion.div
            key={c.handle}
            variants={motionSafe(constellationVariants, reduced)}
            initial="initial"
            animate="animate"
            transition={{ delay: reduced ? 0 : i * 0.05 }}
            style={{ opacity: 0.55 + (i % 5) * 0.09 }}
          >
            <CreatorCard
              handle={c.handle}
              displayName={c.name}
              href={c.href}
              {...(c.bio ? { bio: c.bio } : {})}
              {...(c.live != null ? { live: c.live } : {})}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-label="Creator discovery"
    >
      {creators.map((c) => (
        <CreatorCard
          key={c.handle}
          handle={c.handle}
          displayName={c.name}
          href={c.href}
          {...(c.bio ? { bio: c.bio } : {})}
          {...(c.niche ? { followerLabel: c.niche } : {})}
          {...(c.live != null ? { live: c.live } : {})}
        />
      ))}
    </div>
  );
}
