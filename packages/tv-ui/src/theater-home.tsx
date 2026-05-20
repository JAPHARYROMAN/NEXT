'use client';

import { TvLayout } from '@next/layout-engine';
import { TheaterShell } from '@next/theater-ui';
import { AmbientTheaterOverlay } from '@next/theater-ui';
import { trackTvRenderPerf } from '@next/frontend-utils';
import { useEffect, type ReactNode } from 'react';
import { CinematicHero, type CinematicHeroProps } from './cinematic-hero';
import { TvShelf, type TvShelfProps } from './tv-shelf';
import { TvDiscoveryRails, type TvDiscoveryRailsProps } from './tv-discovery-rails';

export interface TheaterHomeProps {
  readonly hero: CinematicHeroProps;
  readonly shelves: readonly Omit<TvShelfProps, 'className'>[];
  readonly discovery?: TvDiscoveryRailsProps;
  readonly liveSlot?: ReactNode;
  readonly className?: string;
}

export function TheaterHome({ hero, shelves, discovery, liveSlot, className }: TheaterHomeProps) {
  useEffect(() => {
    const t0 = performance.now();
    trackTvRenderPerf('theater_home', Math.round(performance.now() - t0));
  }, []);

  return (
    <TheaterShell {...(className ? { className } : {})}>
      <TvLayout
        ambient={<AmbientTheaterOverlay hue={240} />}
        hero={<CinematicHero {...hero} />}
        shelves={
          <>
            {liveSlot}
            {shelves.map((s) => (
              <TvShelf key={s.id} {...s} />
            ))}
            {discovery ? <TvDiscoveryRails {...discovery} /> : null}
          </>
        }
      />
    </TheaterShell>
  );
}
