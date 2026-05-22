'use client';

import { EmotionAdaptiveBg } from '@next/environment-ui';
import type { CinematicGradient } from '@next/theme-system';
import { useEnvironmentStore } from '@next/frontend-utils';

export interface ImmersiveLightingProps {
  readonly gradient?: CinematicGradient;
  readonly className?: string;
}

export function ImmersiveLighting({ gradient, className }: ImmersiveLightingProps) {
  const mood = useEnvironmentStore((s) => s.mood);
  const resolved =
    gradient ?? (mood === 'energetic' ? 'ember' : mood === 'social' ? 'studio' : 'aurora');

  return <EmotionAdaptiveBg gradient={resolved} {...(className ? { className } : {})} />;
}
