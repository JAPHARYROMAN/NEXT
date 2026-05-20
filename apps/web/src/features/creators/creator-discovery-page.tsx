'use client';

import { useState } from 'react';
import { CreatorDiscoveryGrid, RisingCreatorCard, NicheShelf, FollowShell } from '@next/creator-ui';
import { trackDiscoveryEngagement } from '@next/frontend-utils';
import { demoDiscoveryCreators, demoEmergingCreators, demoNicheShelf } from '@/lib/demo-trends';

const views = ['grid', 'constellation'] as const;

export function CreatorDiscoveryPage() {
  const [view, setView] = useState<(typeof views)[number]>('grid');
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Creators</h1>
        <p className="max-w-2xl text-muted">
          Discover voices by affinity — rising cards, niche shelves, constellation views.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="View mode">
        {views.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            className={
              view === v
                ? 'rounded-full bg-accent px-4 py-1.5 text-sm text-bg'
                : 'rounded-full border border-subtle/20 px-4 py-1.5 text-sm text-muted'
            }
            onClick={() => {
              setView(v);
              trackDiscoveryEngagement('creators', 'view_change', { view: v });
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Rising creators">
        {demoEmergingCreators.map((c) => (
          <div key={c.handle} className="space-y-3">
            <RisingCreatorCard
              handle={c.handle}
              name={c.name}
              niche={c.bio ?? ''}
              growthLabel={c.growthLabel ?? ''}
              href={c.href}
            />
            <FollowShell
              handle={c.handle}
              following={Boolean(following[c.handle])}
              onToggle={(h) => setFollowing((prev) => ({ ...prev, [h]: !prev[h] }))}
            />
          </div>
        ))}
      </section>

      <CreatorDiscoveryGrid creators={demoDiscoveryCreators} view={view} />

      <NicheShelf
        title="Underground niches"
        subtitle="Small-audience, high-craft creators"
        items={demoNicheShelf}
      />
    </div>
  );
}
