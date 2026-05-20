'use client';

import clsx from 'clsx';
import { CinematicPlayer, type CinematicPlayerProps } from './cinematic-player';

export interface TheaterModePlayerProps extends CinematicPlayerProps {
  readonly couchDistance?: 'near' | 'standard' | 'far';
}

/** Large-screen wrapper — scales typography and safe zones for TV viewing distance. */
export function TheaterModePlayer({
  couchDistance = 'standard',
  className,
  ...props
}: TheaterModePlayerProps) {
  const scale =
    couchDistance === 'far' ? 'tv:text-xl' : couchDistance === 'near' ? 'text-base' : 'tv:text-lg';

  return (
    <div
      className={clsx(
        'theater-mode-player relative',
        scale,
        '[--player-safe-x:2.5rem] [--player-safe-y:2rem]',
        className,
      )}
      data-couch-distance={couchDistance}
    >
      <CinematicPlayer {...props} />
    </div>
  );
}
