'use client';

import { LiveEventTv } from '@next/tv-ui';
import { TvExperienceShell } from '@next/tv-ui';
import { demoLiveEvent } from '@/lib/demo-tv';

export function TvLivePage({ eventId }: { readonly eventId: string }) {
  return (
    <TvExperienceShell title="Live event">
      <div className="px-10 py-8 tv:px-14">
        <LiveEventTv
          eventId={eventId}
          title={demoLiveEvent.title}
          startsInSec={demoLiveEvent.startsInSec}
          audienceLabel={demoLiveEvent.audienceLabel}
          highlights={demoLiveEvent.highlights}
        />
      </div>
    </TvExperienceShell>
  );
}
