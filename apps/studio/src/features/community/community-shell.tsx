'use client';

import { CommunitySpace, WatchPartyShell } from '@next/creator-ui';
import { DashboardGrid } from '@next/layout-engine';

export function CommunityShell() {
  return (
    <DashboardGrid columns={2}>
      <CommunitySpace name="Resonance circle" members="2.4k" activeNow={18} />
      <CommunitySpace name="Studio lounge" members="890" />
      <WatchPartyShell
        title="Premiere: Calm horizons"
        participants={['Alex', 'Jordan', 'Sam', 'Riley']}
      />
    </DashboardGrid>
  );
}
