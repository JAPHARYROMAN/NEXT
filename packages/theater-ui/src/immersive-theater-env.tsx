'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { WatchEnvironment } from '@next/immersive-ui';
import { TheaterShell } from './theater-shell';
import { useAmbientPlaybackStore } from '@next/frontend-utils';

export interface ImmersiveTheaterEnvProps {
  readonly viewport: ReactNode;
  readonly metadata?: ReactNode;
  readonly className?: string;
}

/** Theater playback wrapped in immersive watch environment */
export function ImmersiveTheaterEnv({ viewport, metadata, className }: ImmersiveTheaterEnvProps) {
  const setPlaying = useAmbientPlaybackStore((s) => s.setPlaying);

  return (
    <TheaterShell className={clsx(className)}>
      <WatchEnvironment viewport={viewport} metadata={metadata} />
      <button
        type="button"
        className="sr-only"
        onFocus={() => setPlaying(true)}
        onBlur={() => setPlaying(false)}
      >
        Toggle ambient atmosphere
      </button>
    </TheaterShell>
  );
}
