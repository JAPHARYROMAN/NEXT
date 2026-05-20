'use client';

import { useState } from 'react';
import { AdaptiveFeed } from '@next/feed-ui';
import {
  ChaosModeShell,
  CreatorConstellation,
  DiscoveryWaves,
  SemanticExplorer,
} from '@next/discovery-ui';
import { useFeedStore } from '@next/frontend-utils';
import { demoFeedItems } from '@/lib/demo-feed';
import {
  demoChaosItems,
  demoConstellation,
  demoSemanticTopics,
  demoWaves,
} from '@/lib/demo-discovery';
import { CommunityRail } from '@/features/explore/community-rail';

export function DiscoveryExperience() {
  const [waveId, setWaveId] = useState(demoWaves[0]?.id);
  const setMode = useFeedStore((s) => s.setMode);

  return (
    <div className="space-y-12">
      <CommunityRail />
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <DiscoveryWaves
          waves={demoWaves}
          {...(waveId ? { activeId: waveId } : {})}
          onSelect={setWaveId}
        />
        <div className="space-y-10">
          <SemanticExplorer topics={demoSemanticTopics} onTopic={() => setMode('discovery')} />
          <CreatorConstellation nodes={demoConstellation} />
          <ChaosModeShell items={demoChaosItems} />
          <AdaptiveFeed title="Explore worlds" items={demoFeedItems} />
        </div>
      </div>
    </div>
  );
}
