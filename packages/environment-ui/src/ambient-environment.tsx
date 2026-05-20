'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ambientDriftVariants } from '@next/ambient-motion';
import { useAmbientMotion } from '@next/ambient-motion';
import { useRenderTelemetry } from '@next/frontend-utils';
import type { AmbientLightVariant } from '@next/design-system';

export interface AmbientEnvironmentProps {
  readonly children: ReactNode;
  readonly variant?: AmbientLightVariant;
  readonly mood?: 'calm' | 'energetic' | 'focused';
  readonly className?: string;
}

const moodOpacity: Record<NonNullable<AmbientEnvironmentProps['mood']>, string> = {
  calm: 'opacity-40',
  energetic: 'opacity-55',
  focused: 'opacity-35',
};

export function AmbientEnvironment({
  children,
  variant = 'neutral',
  mood = 'calm',
  className,
}: AmbientEnvironmentProps) {
  useRenderTelemetry('AmbientEnvironment');
  const { variants } = useAmbientMotion(ambientDriftVariants);

  return (
    <div
      className={clsx('relative min-h-[50vh] overflow-hidden bg-bg text-fg', className)}
      data-ambient-variant={variant}
      data-ambient-mood={mood}
      role="region"
      aria-label="Ambient environment"
    >
      <motion.div
        aria-hidden
        className={clsx('pointer-events-none absolute inset-0', moodOpacity[mood])}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgb(var(--next-color-accent) / 0.12), transparent 70%)',
        }}
        variants={variants}
        initial="initial"
        animate="animate"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
