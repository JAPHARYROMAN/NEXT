'use client';

import { useState } from 'react';
import { AdaptiveFeed } from '@next/feed-ui';
import { CreatorConstellation, DiscoveryWaves, SemanticExplorer } from '@next/discovery-ui';
import {
  ExploreHero,
  LiveNowShelf,
  TopicPortals,
  ExperimentalShelf,
  EmergingCreatorsShelf,
  ChaosEntry,
} from '@next/explore-ui';
import { ExploreLayout } from '@next/layout-engine';
import {
  useFeedStore,
  trackDiscoveryEngagement,
  trackChaosEntry,
  trackShelfEngagement,
} from '@next/frontend-utils';
import { demoFeedItems } from '@/lib/demo-feed';
import { demoConstellation, demoSemanticTopics, demoWaves } from '@/lib/demo-discovery';
import {
  demoLiveNow,
  demoTopicPortals,
  demoEmergingCreators,
  demoExperimentalMedia,
} from '@/lib/demo-trends';
import { CommunityRail } from '@/features/explore/community-rail';

export function ExploreHome() {
  const [waveId, setWaveId] = useState(demoWaves[0]?.id);
  const setMode = useFeedStore((s) => s.setMode);

  return (
    <div className="p-6 md:p-10">
      <ExploreLayout
        hero={<ExploreHero />}
        waves={
          <DiscoveryWaves
            waves={demoWaves}
            {...(waveId ? { activeId: waveId } : {})}
            onSelect={(id) => {
              setWaveId(id);
              trackDiscoveryEngagement('explore', 'wave_select', { waveId: id });
            }}
          />
        }
      >
        <CommunityRail />
        <LiveNowShelf
          items={demoLiveNow}
          onItemClick={(id) => trackShelfEngagement('live_now', id)}
        />
        <TopicPortals
          portals={demoTopicPortals}
          onPortalClick={(id) => trackShelfEngagement('topic_portal', id)}
        />
        <SemanticExplorer topics={demoSemanticTopics} onTopic={() => setMode('discovery')} />
        <EmergingCreatorsShelf creators={demoEmergingCreators} />
        <ExperimentalShelf items={demoExperimentalMedia} />
        <CreatorConstellation nodes={demoConstellation} />
        <ChaosEntry onEnter={() => trackChaosEntry('explore')} />
        <AdaptiveFeed title="Explore worlds" items={demoFeedItems} />
      </ExploreLayout>
    </div>
  );
}
