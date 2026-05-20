'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { CommunityRoom } from './community-room';

export interface LiveEventLayoutProps {
  readonly hero: ReactNode;
  readonly stage?: ReactNode;
  readonly discussion?: ReactNode;
  readonly className?: string;
}

export function LiveEventLayout({ hero, stage, discussion, className }: LiveEventLayoutProps) {
  return (
    <div className={clsx('space-y-8', className)}>
      {hero}
      {stage}
      {discussion ? (
        <CommunityRoom header={<span className="sr-only">Discussion</span>} main={discussion} />
      ) : null}
    </div>
  );
}
