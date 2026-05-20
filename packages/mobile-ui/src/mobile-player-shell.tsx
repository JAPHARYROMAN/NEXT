'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import { CinematicPlayer, GestureLayer, MiniPlayer, TouchScrubber } from '@next/player-ui';
import {
  trackPlaybackResponsiveness,
  useMobileNavigationStore,
  usePlayerStore,
} from '@next/frontend-utils';

export interface MobilePlayerShellProps {
  readonly mediaId: string;
  readonly title: string;
  readonly className?: string;
}

export function MobilePlayerShell({ mediaId, title, className }: MobilePlayerShellProps) {
  const fullscreen = usePlayerStore((s) => s.fullscreen);
  const playing = usePlayerStore((s) => s.playing);
  const togglePlaying = usePlayerStore((s) => s.togglePlaying);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const setNavState = useMobileNavigationStore((s) => s.setState);
  const currentTime = usePlayerStore((s) => s.currentTimeSec);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTimeSec);

  const onTap = useCallback(() => {
    const start = performance.now();
    setControlsVisible(true);
    trackPlaybackResponsiveness('tap_controls', Math.round(performance.now() - start));
  }, [setControlsVisible]);

  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    setNavState('fullscreen');
  }, [setFullscreen, setNavState]);

  if (!fullscreen) {
    return (
      <div className={clsx('fixed bottom-20 left-4 right-4 z-50', className)}>
        <MiniPlayer title={title} onExpand={enterFullscreen} />
      </div>
    );
  }

  return (
    <div
      className={clsx('fixed inset-0 z-50 bg-black', className)}
      role="application"
      aria-label={`Watching ${title}`}
    >
      <CinematicPlayer mediaId={mediaId} title={title} />
      <GestureLayer onTap={onTap} onDoubleTap={togglePlaying} />
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <TouchScrubber value={currentTime} max={600} onChange={setCurrentTime} playing={playing} />
      </div>
      <button
        type="button"
        className="absolute left-4 top-4 z-30 min-h-[44px] rounded-lg bg-black/50 px-3 text-sm text-white"
        onClick={() => {
          setFullscreen(false);
          setNavState('standard');
        }}
        aria-label="Exit fullscreen"
      >
        Close
      </button>
    </div>
  );
}
