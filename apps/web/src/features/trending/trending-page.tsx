'use client';

import { useState } from 'react';
import { TrendWaveCard, RisingTopicCard, DiscoveryWaves } from '@next/discovery-ui';
import { trackDiscoveryEngagement } from '@next/frontend-utils';
import { demoTrendWaves, demoRisingTopics } from '@/lib/demo-trends';
import { demoWaves } from '@/lib/demo-discovery';

export function TrendingPage() {
  const [regionWave, setRegionWave] = useState(demoWaves[0]?.id);
  const [activeTrend, setActiveTrend] = useState(demoTrendWaves[0]?.id);

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Trending</h1>
        <p className="max-w-2xl text-muted">
          What&apos;s rising across culture — with &ldquo;why rising&rdquo; context, regional
          lenses, and calm presentation.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <DiscoveryWaves
          waves={demoWaves}
          {...(regionWave ? { activeId: regionWave } : {})}
          onSelect={(id) => {
            setRegionWave(id);
            trackDiscoveryEngagement('trending', 'region_select', { waveId: id });
          }}
        />
        <div className="space-y-8">
          <section className="grid gap-4 lg:grid-cols-2" aria-label="Trend movements">
            {demoTrendWaves.map((wave) => (
              <TrendWaveCard
                key={wave.id}
                wave={wave}
                active={activeTrend === wave.id}
                onSelect={(id) => {
                  setActiveTrend(id);
                  trackDiscoveryEngagement('trending', 'trend_select', { trendId: id });
                }}
              />
            ))}
          </section>
          <section className="grid gap-4 sm:grid-cols-2" aria-label="Rising topics">
            {demoRisingTopics.map((topic) => (
              <RisingTopicCard key={topic.id} topic={topic} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
