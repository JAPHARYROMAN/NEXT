import type { TvShelfItem } from '@next/tv-ui';

export const demoTvHero = {
  title: 'Midnight Atlas',
  tagline: 'A slow-burn documentary across hidden cities — best experienced on the big screen.',
  creator: 'Jordan Reyes',
} as const;

export const demoContinueWatching: readonly TvShelfItem[] = [
  { id: 'cw-1', title: 'Echoes in Static', subtitle: '42% · last night', hue: 210 },
  { id: 'cw-2', title: 'Glass Garden', subtitle: '18% · 2 days ago', hue: 160 },
];

export const demoLiveNowShelf: readonly TvShelfItem[] = [
  { id: 'live-1', title: 'Underground Jazz Lab', subtitle: '2.4k resonating', hue: 30 },
];

export const demoCreatorSpotlight: readonly TvShelfItem[] = [
  { id: 'cr-1', title: 'Analog Dreams', subtitle: '@velvetfreq', hue: 200 },
];

export const demoWatchPartyShelf: readonly TvShelfItem[] = [
  { id: 'wp-1', title: 'Couch screening: Neon Drift', subtitle: '8 friends', hue: 180 },
];

export const demoTvDiscovery = {
  waves: [{ id: 'w1', label: 'Cultural waves', description: 'Emerging scenes tonight' }],
  topics: [{ id: 't1', label: 'Ambient sound', relation: 'near' as const }],
  creators: [{ handle: 'velvetfreq', name: 'Velvet Freq', affinity: 0.9 }],
};

export const demoLiveEvent = {
  title: 'Aurora Stage — Global Listening Room',
  audienceLabel: '18.2k waiting in the theater',
};
