'use client';

import { TvDiscoveryRails } from '@next/tv-ui';
import { TvExperienceShell } from '@next/tv-ui';
import { TvShelf } from '@next/tv-ui';
import { demoTvDiscovery, demoCreatorSpotlight } from '@/lib/demo-tv';

export function TvDiscoverPage() {
  return (
    <TvExperienceShell title="Discover">
      <div className="space-y-14 px-10 py-8 tv:px-14">
        <TvDiscoveryRails {...demoTvDiscovery} />
        <TvShelf id="spotlight" title="Rising creators" items={demoCreatorSpotlight} />
      </div>
    </TvExperienceShell>
  );
}
