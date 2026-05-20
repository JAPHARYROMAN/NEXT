'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { discoveryRevealVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Focusable } from '@next/remote-navigation';
import { Badge } from '@next/ui';

export interface CinematicHeroProps {
  readonly title: string;
  readonly tagline: string;
  readonly creator?: string;
  readonly onWatch?: () => void;
  readonly onExplore?: () => void;
  readonly className?: string;
}

export function CinematicHero({
  title,
  tagline,
  creator,
  onWatch,
  onExplore,
  className,
}: CinematicHeroProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      variants={motionSafe(discoveryRevealVariants, reduced)}
      initial="initial"
      animate="animate"
      className={clsx('relative min-h-[42vh] rounded-3xl overflow-hidden', className)}
      aria-label="Featured media"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-bg to-bg"
        aria-hidden
      />
      <div className="relative z-10 flex h-full flex-col justify-end p-10 tv:p-14">
        <Badge tone="accent" className="mb-4 w-fit">
          Theater premiere
        </Badge>
        <h1 className="font-display text-5xl font-semibold tracking-tight tv:text-6xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted tv:text-xl">{tagline}</p>
        {creator ? <p className="mt-2 text-accent tv:text-lg">by {creator}</p> : null}
        <div className="mt-8 flex flex-wrap gap-4">
          <Focusable focusId="hero-watch" row={1} col={0} onClick={onWatch}>
            Watch in theater
          </Focusable>
          <Focusable focusId="hero-explore" row={1} col={1} onClick={onExplore}>
            Continue exploring
          </Focusable>
        </div>
      </div>
    </motion.section>
  );
}
