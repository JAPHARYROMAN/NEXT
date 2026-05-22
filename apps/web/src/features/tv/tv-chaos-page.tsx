'use client';

import { ChaosTv } from '@next/tv-ui';
import { TvExperienceShell } from '@next/tv-ui';
import { demoChaosTvItems } from '@/lib/demo-tv';

export function TvChaosPage() {
  return (
    <TvExperienceShell title="Chaos TV">
      <div className="px-10 py-8 tv:px-14">
        <ChaosTv items={demoChaosTvItems} />
      </div>
    </TvExperienceShell>
  );
}
