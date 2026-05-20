'use client';

import clsx from 'clsx';
import { IconPlay } from '@next/icons';
import { Button } from '@next/ui';
import type { MediaKind } from '@next/frontend-utils';

export interface PlayerControlsProps {
  readonly title: string;
  readonly kind?: MediaKind;
  readonly playing?: boolean;
  readonly controlsVisible?: boolean;
  readonly onPlayPause?: () => void;
  readonly onTheater?: () => void;
  readonly onFullscreen?: () => void;
  readonly onSubtitles?: () => void;
  readonly className?: string;
}

const kindLabel: Record<MediaKind, string> = {
  long: 'Long-form',
  short: 'Short',
  live: 'Live',
  clip: 'Clip',
};

export function PlayerControls({
  title,
  kind = 'long',
  playing = false,
  controlsVisible = true,
  onPlayPause,
  onTheater,
  onFullscreen,
  onSubtitles,
  className,
}: PlayerControlsProps) {
  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300',
        controlsVisible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      aria-hidden={!controlsVisible}
    >
      <div className="pointer-events-auto flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-white/50">{kindLabel[kind]}</p>
          <p className="truncate text-base font-medium text-white">{title}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Playback controls">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onPlayPause}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <IconPlay size={18} aria-hidden />
            <span className="sr-only">{playing ? 'Pause' : 'Play'}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onTheater}
            aria-label="Theater mode"
          >
            Theater
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onFullscreen}
            aria-label="Fullscreen"
          >
            Fullscreen
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onSubtitles}
            aria-label="Subtitles"
          >
            CC
          </Button>
        </div>
      </div>
    </div>
  );
}
