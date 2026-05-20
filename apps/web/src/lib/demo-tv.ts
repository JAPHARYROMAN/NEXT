import type { TvShelfItem } from '@next/tv-ui';
import type { ChaosItem } from '@next/discovery-ui';
import type { DiscoveryWave, SemanticTopic, ConstellationNode } from '@next/discovery-ui';

export const demoTvHero = {
  title: 'Midnight Atlas',
  tagline: 'A slow-burn documentary across hidden cities — best experienced on the big screen.',
  creator: 'Jordan Reyes',
} as const;

export const demoContinueWatching: readonly TvShelfItem[] = [
  { id: 'cw-1', title: 'Echoes in Static', subtitle: '42% · last night', hue: 210 },
  { id: 'cw-2', title: 'Glass Garden', subtitle: '18% · 2 days ago', hue: 160 },
  { id: 'cw-3', title: 'Signal Bloom', subtitle: '67% · this week', hue: 280 },
];

export const demoLiveNowShelf: readonly TvShelfItem[] = [
  { id: 'live-1', title: 'Underground Jazz Lab', subtitle: '2.4k resonating', hue: 30 },
  { id: 'live-2', title: 'Creator Office Hours', subtitle: 'Hosted by Mira', hue: 340 },
];

export const demoCreatorSpotlight: readonly TvShelfItem[] = [
  { id: 'cr-1', title: 'Analog Dreams', subtitle: '@velvetfreq', hue: 200 },
  { id: 'cr-2', title: 'Slow Cinema Club', subtitle: '@nightframe', hue: 260 },
];

export const demoWatchPartyShelf: readonly TvShelfItem[] = [
  {
    id: 'wp-1',
    title: 'Couch screening: Neon Drift',
    subtitle: '8 friends · starts soon',
    hue: 180,
  },
  { id: 'wp-2', title: 'Creator premiere party', subtitle: 'Hosted by Jordan', hue: 50 },
];

export const demoTvDiscovery = {
  waves: [
    { id: 'w1', label: 'Cultural waves', description: 'Emerging scenes crossing borders tonight' },
    { id: 'w2', label: 'Adjacent curiosity', description: 'Expand from your last theater session' },
  ] satisfies readonly DiscoveryWave[],
  topics: [
    { id: 't1', label: 'Ambient sound', relation: 'near' },
    { id: 't2', label: 'Slow cinema', relation: 'far' },
  ] satisfies readonly SemanticTopic[],
  creators: [
    { handle: 'velvetfreq', name: 'Velvet Freq', affinity: 0.9 },
    { handle: 'nightframe', name: 'Night Frame', affinity: 0.7 },
  ] satisfies readonly ConstellationNode[],
};

export const demoLiveEvent = {
  eventId: 'live-aurora-1',
  title: 'Aurora Stage — Global Listening Room',
  startsInSec: 12 * 60 + 34,
  audienceLabel: '18.2k waiting in the theater',
  highlights: ['Creator live-stage', 'Synced reactions', 'Post-show community lounge'],
} as const;

export const demoChaosTvItems: readonly ChaosItem[] = [
  { id: 'ch-1', title: 'Signal Mycelium', creator: 'root.tunnel', hue: 120 },
  { id: 'ch-2', title: 'VHS Cathedral', creator: 'tape.ghost', hue: 280 },
  { id: 'ch-3', title: 'Lo-fi Weather', creator: 'cloud.bed', hue: 200 },
];

export const demoTheaterChapters = [
  { id: '1', label: 'Opening drift', startSec: 0 },
  { id: '2', label: 'City lights', startSec: 420 },
  { id: '3', label: 'Final chorus', startSec: 1680 },
] as const;
