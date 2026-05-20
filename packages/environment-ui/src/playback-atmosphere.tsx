'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { audioPulseVariants } from '@next/ambient-motion';
import { useAmbientMotion } from '@next/ambient-motion';

export interface PlaybackAtmosphereProps {
  readonly active?: boolean;
  readonly intensity?: 'subtle' | 'medium';
  readonly className?: string;
}

/** CSS/motion placeholder for audio-reactive ambience — no real audio analysis */
export function PlaybackAtmosphere({
  active = false,
  intensity = 'subtle',
  className,
}: PlaybackAtmosphereProps) {
  const { variants, reduced } = useAmbientMotion(audioPulseVariants);

  if (reduced) {
    return (
      <div
        aria-hidden
        className={clsx('pointer-events-none absolute inset-0', className)}
        data-atmosphere="static"
      />
    );
  }

  return (
    <motion.div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0',
        intensity === 'medium' ? 'opacity-50' : 'opacity-30',
        className,
      )}
      variants={variants}
      animate={active ? 'pulse' : 'idle'}
      transition={{ repeat: active ? Infinity : 0, duration: 2.4, ease: 'easeInOut' }}
      style={{
        background:
          'radial-gradient(circle at 50% 100%, rgb(var(--next-color-brand) / 0.08), transparent 55%)',
      }}
      data-atmosphere={active ? 'pulse' : 'idle'}
    />
  );
}
