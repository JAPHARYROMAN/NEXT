'use client';

import { useState } from 'react';
import { TrendWaveCard, RisingTopicCard } from '@next/discovery-ui';
import { TopicPortals } from '@next/explore-ui';
import { trackDiscoveryEngagement } from '@next/frontend-utils';
import { demoTrendWaves, demoRisingTopics, demoTopicPortals } from '@/lib/demo-trends';

export function DiscoverPage() {
  const [activeWave, setActiveWave] = useState(demoTrendWaves[0]?.id);

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Discover</h1>
        <p className="max-w-2xl text-muted">
          Cultural movements and rising topics — explained with context, not rage metrics.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Cultural waves">
        {demoTrendWaves.map((wave) => (
          <TrendWaveCard
            key={wave.id}
            wave={wave}
            active={activeWave === wave.id}
            onSelect={(id) => {
              setActiveWave(id);
              trackDiscoveryEngagement('discover', 'wave_select', { waveId: id });
            }}
          />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Rising topics">
        {demoRisingTopics.map((topic) => (
          <RisingTopicCard
            key={topic.id}
            topic={topic}
            onSelect={(id) => trackDiscoveryEngagement('discover', 'topic_select', { topicId: id })}
          />
        ))}
      </section>

      <TopicPortals portals={demoTopicPortals} />
    </div>
  );
}
