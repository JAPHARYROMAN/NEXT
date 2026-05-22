'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export type CommunityRoomMode = 'discussion-first' | 'media-first' | 'balanced';

export interface CommunityRoomProps {
  readonly header: ReactNode;
  readonly main: ReactNode;
  readonly aside?: ReactNode;
  readonly mode?: CommunityRoomMode;
  readonly className?: string;
}

const modeClass: Record<CommunityRoomMode, string> = {
  'discussion-first': 'lg:grid-cols-[1fr_320px]',
  'media-first': 'lg:grid-cols-[320px_1fr]',
  balanced: 'lg:grid-cols-[1fr_1fr]',
};

export function CommunityRoom({
  header,
  main,
  aside,
  mode = 'discussion-first',
  className,
}: CommunityRoomProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {header}
      <div className={clsx('grid gap-6', aside ? modeClass[mode] : '')}>
        <div className="min-w-0">{main}</div>
        {aside ? <aside className="min-w-0 space-y-4">{aside}</aside> : null}
      </div>
    </div>
  );
}
