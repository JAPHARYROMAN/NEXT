'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { applyAmbientLighting } from '@next/theme-system';

export interface CinematicHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly gradient?: 'aurora' | 'ember' | 'depth' | 'studio';
  readonly className?: string;
}

const gradientClass: Record<NonNullable<CinematicHeaderProps['gradient']>, string> = {
  aurora: 'creator-gradient-aurora',
  ember: 'creator-gradient-ember',
  depth: 'creator-gradient-depth',
  studio: 'creator-gradient-studio',
};

export function CinematicHeader({
  title,
  subtitle,
  actions,
  gradient = 'aurora',
  className,
}: CinematicHeaderProps) {
  const reduced = useReducedMotion();

  return (
    <header
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-subtle/15 p-8',
        gradientClass[gradient],
        className,
      )}
      ref={(el) => {
        if (el) applyAmbientLighting(el, gradient);
      }}
    >
      <motion.div
        className="relative z-10 flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent"
        aria-hidden
      />
    </header>
  );
}
