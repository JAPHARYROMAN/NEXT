'use client';

import clsx from 'clsx';
import { Focusable } from '@next/remote-navigation';
import { usePlayerStore, trackPlaybackResponsiveness } from '@next/frontend-utils';

export interface TheaterControlsProps {
  readonly className?: string;
}

/** Remote-friendly playback controls — large targets, calm spacing. */
export function TheaterControls({ className }: TheaterControlsProps) {
  const playing = usePlayerStore((s) => s.playing);
  const subtitlesOn = usePlayerStore((s) => s.subtitlesOn);
  const togglePlaying = usePlayerStore((s) => s.togglePlaying);
  const toggleSubtitles = usePlayerStore((s) => s.toggleSubtitles);

  const act = (label: string, fn: () => void) => {
    const t0 = performance.now();
    fn();
    trackPlaybackResponsiveness(label, Math.round(performance.now() - t0));
  };

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-4 rounded-2xl bg-black/50 px-6 py-4 backdrop-blur-md',
        className,
      )}
      role="toolbar"
      aria-label="Theater playback controls"
    >
      <Focusable row={0} col={0} onClick={() => act('play_pause', togglePlaying)}>
        {playing ? 'Pause' : 'Play'}
      </Focusable>
      <Focusable row={0} col={1} onClick={() => act('subtitles', toggleSubtitles)}>
        {subtitlesOn ? 'Captions on' : 'Captions off'}
      </Focusable>
      <Focusable row={0} col={2} onClick={() => act('chapters', () => {})}>
        Chapters
      </Focusable>
    </div>
  );
}
