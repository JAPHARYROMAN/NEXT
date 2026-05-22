'use client';

import clsx from 'clsx';
export type PlayerMode = 'mini' | 'theater' | 'live' | 'clip';
import { IconPlay } from '@next/icons';

export interface PlayerShellProps {
  readonly mode: PlayerMode;
  readonly title?: string | null;
  readonly className?: string;
}

const modeLabel: Record<PlayerMode, string> = {
  mini: 'Mini player',
  theater: 'Theater mode',
  live: 'Live',
  clip: 'Clip',
};

export function PlayerShell({ mode, title, className }: PlayerShellProps) {
  const isMini = mode === 'mini';

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-black text-white',
        isMini ? 'h-14' : 'aspect-video w-full',
        className,
      )}
      role="region"
      aria-label={modeLabel[mode]}
    >
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center',
          'bg-gradient-to-br from-neutral-900 via-neutral-950 to-black',
        )}
      >
        <IconPlay size={isMini ? 20 : 48} aria-hidden />
      </div>
      {title && !isMini ? (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-6">
          <p className="text-sm text-white/70">{modeLabel[mode]}</p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
        </div>
      ) : null}
    </div>
  );
}
