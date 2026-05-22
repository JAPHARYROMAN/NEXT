'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { DepthLayout } from '@next/layout-engine';
import { CinematicDepth } from './cinematic-depth';
import { ImmersiveLighting } from './immersive-lighting';

export interface DiscoveryRoomProps {
  readonly hero: ReactNode;
  readonly rails?: ReactNode;
  readonly className?: string;
}

export function DiscoveryRoom({ hero, rails, className }: DiscoveryRoomProps) {
  return (
    <DepthLayout
      className={clsx('relative', className)}
      ambient={<ImmersiveLighting />}
      foreground={
        <div className="space-y-10">
          <CinematicDepth tier="near">{hero}</CinematicDepth>
          {rails ? <CinematicDepth tier="mid">{rails}</CinematicDepth> : null}
        </div>
      }
    />
  );
}
