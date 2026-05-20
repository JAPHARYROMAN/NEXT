'use client';

import { useRouter } from 'next/navigation';
import { TheaterHome } from '@next/tv-ui';
import { LiveEventTv } from '@next/tv-ui';
import {
  demoTvHero,
  demoContinueWatching,
  demoLiveNowShelf,
  demoCreatorSpotlight,
  demoWatchPartyShelf,
  demoTvDiscovery,
  demoLiveEvent,
} from '@/lib/demo-tv';

export function TheaterHomePage() {
  const router = useRouter();

  return (
    <TheaterHome
      hero={{
        ...demoTvHero,
        onWatch: () => router.push('/tv/watch/cw-1'),
        onExplore: () => router.push('/tv/discover'),
      }}
      liveSlot={<LiveEventTv {...demoLiveEvent} onJoin={() => router.push('/tv/live/aurora-1')} />}
      shelves={[
        { id: 'continue', title: 'Continue watching', items: demoContinueWatching },
        { id: 'live', title: 'Live now', items: demoLiveNowShelf },
        { id: 'creators', title: 'Creator spotlight', items: demoCreatorSpotlight },
        {
          id: 'parties',
          title: 'Watch parties',
          items: demoWatchPartyShelf,
          onSelect: (item) => router.push(`/tv/party/${item.id}`),
        },
      ]}
      discovery={demoTvDiscovery}
    />
  );
}
