'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { TheaterLayout } from '@next/layout-engine';
import { FocusProvider } from '@next/remote-navigation';
import { usePlayerStore, useTvSessionStore, trackPlaybackQoe } from '@next/frontend-utils';
import { CinematicPlayer } from '@next/player-ui';
import { TheaterControls } from './theater-controls';
import { AmbientTheaterOverlay } from './ambient-theater-overlay';
import { MetadataOverlay } from './metadata-overlay';
import { SocialTheaterOverlay } from './social-theater-overlay';
import { ChapterNav, type TheaterChapter } from './chapter-nav';

export interface TheaterPlayerProps {
  readonly mediaId: string;
  readonly title: string;
  readonly creator: string;
  readonly synopsis?: string;
  readonly chapters?: readonly TheaterChapter[];
  readonly className?: string;
}

export function TheaterPlayer({
  mediaId,
  title,
  creator,
  synopsis,
  chapters = [],
  className,
}: TheaterPlayerProps) {
  const setMode = usePlayerStore((s) => s.setMode);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const overlay = useTvSessionStore((s) => s.playbackOverlay);
  useEffect(() => {
    setMode('theater');
    setFullscreen(true);
    trackPlaybackQoe('startup', Math.round(performance.now()));
    return () => setFullscreen(false);
  }, [mediaId, setFullscreen, setMode]);

  const viewport = (
    <div className={clsx('relative h-full min-h-[70vh]', className)}>
      <AmbientTheaterOverlay />
      <CinematicPlayer mediaId={mediaId} title={title} kind="long" />
      {controlsVisible ? (
        <div className="absolute inset-x-0 bottom-0 z-30 p-8">
          <FocusProvider>
            <TheaterControls />
          </FocusProvider>
        </div>
      ) : null}
    </div>
  );

  const rail =
    overlay === 'chapters' && chapters.length > 0 ? <ChapterNav chapters={chapters} /> : null;

  return (
    <TheaterLayout
      viewport={viewport}
      rail={rail}
      overlay={
        <>
          <div className="pointer-events-auto absolute left-8 top-8 z-30">
            <MetadataOverlay title={title} creator={creator} {...(synopsis ? { synopsis } : {})} />
          </div>
          <div className="pointer-events-auto absolute right-8 top-8 z-30">
            <SocialTheaterOverlay />
          </div>
        </>
      }
    />
  );
}
