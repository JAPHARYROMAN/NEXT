'use client';

import { Surface } from '@next/ui';
import clsx from 'clsx';

export interface CommunitySpaceProps {
  readonly name: string;
  readonly members: string;
  readonly activeNow?: number;
  readonly className?: string;
}

export function CommunitySpace({ name, members, activeNow, className }: CommunitySpaceProps) {
  return (
    <Surface bordered elevation="cinematic" className={clsx('p-5', className)}>
      <h3 className="font-medium">{name}</h3>
      <p className="mt-1 text-sm text-muted">{members} members</p>
      {activeNow != null ? (
        <p className="mt-3 text-xs text-accent">{activeNow} resonating now</p>
      ) : null}
      <p className="mt-4 text-xs text-muted">Discussion shell — realtime overlay pending.</p>
    </Surface>
  );
}
