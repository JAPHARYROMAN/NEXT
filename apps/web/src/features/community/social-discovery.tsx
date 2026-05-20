'use client';

import { useState } from 'react';
import { CommunityDiscoveryGrid, CulturalWave, EmergingCommunityCard } from '@next/social-ui';
import { CreatorConstellation } from '@next/discovery-ui';
import { CommunitySearchResults, InterestClusterView } from '@next/community-ui';
import { useCommunityFilterStore, trackDiscoveryEngagement } from '@next/frontend-utils';
import { demoCulturalWaves, demoDiscoveryCommunities } from '@/lib/demo-communities';
import { demoConstellation } from '@/lib/demo-discovery';
import { demoInterestClusters } from '@/lib/demo-trends';

const filters = ['all', 'joined', 'emerging', 'underground'] as const;

const demoCommunitySearchResults = demoDiscoveryCommunities.map((c) => ({
  slug: c.id,
  name: c.name,
  description: c.description,
  memberCount: c.memberCount,
  href: c.href,
  ...(c.mood ? { mood: c.mood } : {}),
  healthScore: c.mood === 'chaos' ? 0.62 : 0.85,
  matchReason: 'Semantic match · calm gathering space',
}));

export function SocialDiscovery() {
  const [waveId, setWaveId] = useState(demoCulturalWaves[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const filter = useCommunityFilterStore((s) => s.filter);
  const setFilter = useCommunityFilterStore((s) => s.setFilter);

  const filtered =
    filter === 'all'
      ? demoDiscoveryCommunities
      : demoDiscoveryCommunities.filter((c) =>
          filter === 'underground' ? c.mood === 'chaos' : c.mood !== 'chaos',
        );

  const searchResults = searchQuery
    ? demoCommunitySearchResults.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Communities</h1>
        <p className="max-w-2xl text-muted">
          Discover intimate circles — underground niches, emerging creators, and calm gathering
          spaces. No engagement farming.
        </p>
      </header>

      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="community-search" className="sr-only">
          Search communities
        </label>
        <input
          id="community-search"
          type="search"
          placeholder="Search communities by vibe or topic…"
          value={searchQuery}
          className="w-full rounded-xl border border-subtle/20 bg-surface px-4 py-3 text-sm"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {searchQuery ? <CommunitySearchResults results={searchResults} query={searchQuery} /> : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Community filters">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={
              filter === f
                ? 'rounded-full bg-accent px-4 py-1.5 text-sm text-bg'
                : 'rounded-full border border-subtle/20 px-4 py-1.5 text-sm text-muted'
            }
            onClick={() => {
              setFilter(f);
              trackDiscoveryEngagement('communities', 'filter', { filter: f });
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <CulturalWave
          waves={demoCulturalWaves}
          {...(waveId ? { activeId: waveId } : {})}
          onSelect={(id) => {
            setWaveId(id);
            trackDiscoveryEngagement('communities', 'wave_select', { waveId: id });
          }}
        />
        <div className="space-y-10">
          <CommunityDiscoveryGrid communities={filtered} />
          <section className="grid gap-4 sm:grid-cols-2" aria-label="Emerging communities">
            <EmergingCommunityCard
              name="Tape Hiss Collective"
              niche="Lo-fi field recordings · 240 members"
              growthLabel="+18% this month"
              href="/community/chaos-hour"
            />
            <EmergingCommunityCard
              name="Small Room Sessions"
              niche="Acoustic living-room sets"
              growthLabel="Creator-led · underground"
              href="/community/quiet-signals"
            />
          </section>
          {demoInterestClusters.map((cluster) => (
            <InterestClusterView key={cluster.id} cluster={cluster} />
          ))}
          <CreatorConstellation nodes={demoConstellation} />
        </div>
      </div>
    </div>
  );
}
