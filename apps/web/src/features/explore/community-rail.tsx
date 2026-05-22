'use client';

import { CommunityCard } from '@next/ui';
import { GridZone } from '@next/layout-engine';

const demoCommunities = [
  {
    id: 'c1',
    name: 'Quiet Signals',
    description: 'Slow cinema, ambient scores, and late-night edits.',
    memberCount: '12.4k',
    href: '/community/quiet-signals',
    mood: 'calm' as const,
  },
  {
    id: 'c2',
    name: 'Chaos Hour',
    description: 'Unlisted experiments and underground culture.',
    memberCount: '3.1k',
    href: '/community/chaos-hour',
    mood: 'chaos' as const,
  },
  {
    id: 'c3',
    name: 'Learn Forward',
    description: 'Craft, technique, and generous teaching.',
    memberCount: '8.7k',
    href: '/community/learn-forward',
    mood: 'learn' as const,
  },
];

export function CommunityRail() {
  return (
    <section aria-label="Communities" className="space-y-4">
      <h2 className="text-lg font-semibold">Communities</h2>
      <GridZone columns={3}>
        {demoCommunities.map((c) => (
          <CommunityCard key={c.id} {...c} />
        ))}
      </GridZone>
    </section>
  );
}
