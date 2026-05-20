'use client';

import { TheaterHome } from '@next/tv-ui';
import {
  demoTvHero,
  demoContinueWatching,
  demoLiveNowShelf,
  demoCreatorSpotlight,
  demoWatchPartyShelf,
  demoTvDiscovery,
  demoLiveEvent,
} from './demo-tv';

/** Lightweight Vite shell for Tizen / WebOS / browser-on-TV targets. */
export function App() {
  return (
    <TheaterHome
      hero={demoTvHero}
      liveSlot={
        <section className="rounded-3xl border border-white/10 p-8">
          <h2 className="text-3xl font-semibold">{demoLiveEvent.title}</h2>
          <p className="mt-2 text-white/60">{demoLiveEvent.audienceLabel}</p>
        </section>
      }
      shelves={[
        { id: 'continue', title: 'Continue watching', items: demoContinueWatching },
        { id: 'live', title: 'Live now', items: demoLiveNowShelf },
        { id: 'creators', title: 'Creator spotlight', items: demoCreatorSpotlight },
        { id: 'parties', title: 'Watch parties', items: demoWatchPartyShelf },
      ]}
      discovery={demoTvDiscovery}
    />
  );
}
