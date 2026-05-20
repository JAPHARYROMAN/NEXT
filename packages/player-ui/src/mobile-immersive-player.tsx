'use client';

import clsx from 'clsx';
import { CinematicPlayer } from './cinematic-player';
import { GestureLayer } from './gesture-layer';
import { usePlayerStore, useMobileNavigationStore } from '@next/frontend-utils';

export interface MobileImmersivePlayerProps {
  readonly mediaId: string;
  readonly title: string;
  readonly className?: string;
}

export function MobileImmersivePlayer({ mediaId, title, className }: MobileImmersivePlayerProps) {
  const togglePlaying = usePlayerStore((s) => s.togglePlaying);
  const setNavState = useMobileNavigationStore((s) => s.setState);

  return (
    <div
      className={clsx(
        'relative aspect-video w-full overflow-hidden rounded-none bg-black',
        className,
      )}
      onPointerEnter={() => setNavState('fullscreen')}
    >
      <CinematicPlayer mediaId={mediaId} title={title} />
      <GestureLayer onDoubleTap={togglePlaying} />
    </div>
  );
}
