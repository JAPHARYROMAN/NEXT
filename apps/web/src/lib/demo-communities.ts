import type { DiscoverableCommunity } from '@next/social-ui';
import type { TimelineEntry } from '@next/community-ui';
import type { ThreadComment } from '@next/social-ui';
import type { CulturalWaveItem } from '@next/social-ui';

export interface DemoCommunity {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly memberCount: string;
  readonly activeNow: number;
  readonly mood: 'calm' | 'chaos' | 'learn';
  readonly accentHue: number;
  readonly avatarLabel: string;
  readonly tags: readonly string[];
}

export const demoCommunities: readonly DemoCommunity[] = [
  {
    slug: 'quiet-signals',
    name: 'Quiet Signals',
    tagline: 'Slow cinema, ambient scores, and late-night edits.',
    memberCount: '12.4k',
    activeNow: 18,
    mood: 'calm',
    accentHue: 210,
    avatarLabel: 'QS',
    tags: ['ambient', 'cinema', 'calm'],
  },
  {
    slug: 'chaos-hour',
    name: 'Chaos Hour',
    tagline: 'Unlisted experiments and underground culture.',
    memberCount: '3.1k',
    activeNow: 42,
    mood: 'chaos',
    accentHue: 320,
    avatarLabel: 'CH',
    tags: ['experimental', 'underground'],
  },
  {
    slug: 'learn-forward',
    name: 'Learn Forward',
    tagline: 'Craft, technique, and generous teaching.',
    memberCount: '8.7k',
    activeNow: 9,
    mood: 'learn',
    accentHue: 160,
    avatarLabel: 'LF',
    tags: ['education', 'craft'],
  },
] as const;

export function getCommunityBySlug(slug: string): DemoCommunity | undefined {
  return demoCommunities.find((c) => c.slug === slug);
}

export const demoDiscoveryCommunities: readonly DiscoverableCommunity[] = demoCommunities.map(
  (c) => ({
    id: c.slug,
    name: c.name,
    description: c.tagline,
    memberCount: c.memberCount,
    href: `/community/${c.slug}`,
    mood: c.mood,
  }),
);

export const demoCulturalWaves: readonly CulturalWaveItem[] = [
  { id: 'w1', label: 'Ambient resurgence', intensity: 0.82 },
  { id: 'w2', label: 'Micro-creator circles', intensity: 0.64 },
  { id: 'w3', label: 'Live ritual nights', intensity: 0.71 },
];

export const demoTimeline: readonly TimelineEntry[] = [
  { id: 't1', label: 'Weekly listening ritual started', time: '2h ago', kind: 'ritual' },
  { id: 't2', label: 'New media collection: Winter cuts', time: '1d ago', kind: 'media' },
  { id: 't3', label: 'Pinned discussion: Intro thread', time: '3d ago', kind: 'discussion' },
];

export const demoDiscussions: readonly ThreadComment[] = [
  {
    id: 'd1',
    author: 'Mira',
    body: 'This space feels intentionally calm — grateful for no rage ranking.',
    time: '12m ago',
  },
  {
    id: 'd2',
    author: 'Sol',
    body: 'The ritual last night was beautiful.',
    time: '1h ago',
    depth: 1,
    quoteOf: 'Weekly listening ritual',
  },
  {
    id: 'd3',
    author: 'Kai',
    body: 'Sharing a clip from the ambient set.',
    time: '2h ago',
    hasMedia: true,
  },
];
