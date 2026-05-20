'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { PlaybackAtmosphere } from '@next/environment-ui';
import { CinematicViewport } from '@next/layout-engine';
import { useAmbientPlaybackStore } from '@next/frontend-utils';

export interface WatchEnvironmentProps {
  readonly viewport: ReactNode;
  readonly metadata?: ReactNode;
  readonly className?: string;
}

export function WatchEnvironment({ viewport, metadata, className }: WatchEnvironmentProps) {
  const playing = useAmbientPlaybackStore((s) => s.playing);
  const atmosphere = useAmbientPlaybackStore((s) => s.atmosphereIntensity);

  return (
    <CinematicViewport
      className={clsx('relative bg-black', className)}
      viewport={
        <>
          <PlaybackAtmosphere active={playing} intensity={atmosphere} />
          {viewport}
        </>
      }
      chrome={metadata}
    />
  );
}
