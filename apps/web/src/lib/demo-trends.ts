import type { TrendWave, RisingTopic } from '@next/discovery-ui';
import type { LiveNowItem, TopicPortal, EmergingCreator, ExperimentalItem } from '@next/explore-ui';

export const demoTrendWaves: readonly TrendWave[] = [
  {
    id: 'tw-1',
    label: 'Slow cinema revival',
    movement: 'Long-form ambient narratives gaining cultural momentum',
    whyRising: 'Creators prioritizing patience over hooks — audience seeking calm depth.',
    region: 'Global',
    velocity: 0.72,
  },
  {
    id: 'tw-2',
    label: 'Tape hiss aesthetics',
    movement: 'Lo-fi field recording communities expanding',
    whyRising: 'Underground sound culture crossing into mainstream discovery.',
    region: 'EU · JP',
    velocity: 0.58,
  },
  {
    id: 'tw-3',
    label: 'Small room live',
    movement: 'Intimate acoustic sessions from living rooms',
    whyRising: 'Authenticity over production — human-scale performance.',
    region: 'Americas',
    velocity: 0.65,
  },
];

export const demoRisingTopics: readonly RisingTopic[] = [
  {
    id: 'rt-1',
    label: 'Generative film',
    context: 'AI-assisted visuals with human editorial voice',
    sentiment: 'experimental',
  },
  {
    id: 'rt-2',
    label: 'Night walks',
    context: 'Urban exploration without narration',
    sentiment: 'curious',
  },
  {
    id: 'rt-3',
    label: 'Community teaching',
    context: 'Generous craft sharing in small circles',
    sentiment: 'warm',
  },
];

export const demoLiveNow: readonly LiveNowItem[] = [
  {
    id: 'live-1',
    title: 'Ambient drift session',
    creator: '@drift',
    viewerLabel: '842 watching',
    href: '/live/live-1',
    hue: 280,
  },
  {
    id: 'live-2',
    title: 'Modular synthesis jam',
    creator: '@patch',
    viewerLabel: '312 watching',
    href: '/live/live-2',
    hue: 45,
  },
  {
    id: 'live-3',
    title: 'Small room acoustic',
    creator: '@room',
    viewerLabel: '128 watching',
    href: '/live/live-3',
    hue: 160,
  },
];

export const demoTopicPortals: readonly TopicPortal[] = [
  {
    id: 'tp-1',
    label: 'Urban night',
    description: 'City after dark — walks, neon, silence',
    href: '/search?q=urban+night',
    hue: 220,
  },
  {
    id: 'tp-2',
    label: 'Craft & technique',
    description: 'Learn-forward creator education',
    href: '/search?q=craft&intent=learn',
    hue: 180,
  },
  {
    id: 'tp-3',
    label: 'Underground live',
    description: 'Experimental broadcasts happening now',
    href: '/search?q=live&intent=live',
    hue: 300,
  },
];

export const demoEmergingCreators: readonly EmergingCreator[] = [
  {
    handle: 'vesper',
    name: 'Vesper',
    bio: 'Dawn timelapses and quiet observation',
    href: '/creator/vesper',
    growthLabel: '+24% this month',
  },
  {
    handle: 'static',
    name: 'Static',
    bio: 'CRT aesthetics and signal decay',
    href: '/creator/static',
    growthLabel: 'Underground · rising',
  },
];

export const demoExperimentalMedia: readonly ExperimentalItem[] = [
  {
    id: 'e1',
    title: 'Signal bleed (directors cut)',
    creator: '@drift',
    href: '/watch/e1',
    hue: 130,
  },
  {
    id: 'e2',
    title: 'Unlisted corridor',
    creator: '@void',
    href: '/watch/e2',
    hue: 300,
  },
  {
    id: 'e3',
    title: 'Grain study no. 7',
    creator: '@grain',
    href: '/watch/e3',
    hue: 55,
  },
];

export const demoDiscoveryCreators = [
  {
    handle: 'lumen',
    name: 'Lumen',
    bio: 'Slow reveals and urban nightscapes',
    href: '/creator/lumen',
    niche: 'Cinematic · 48k followers',
  },
  {
    handle: 'frame',
    name: 'Frame',
    bio: 'Documentary craft and patient editing',
    href: '/creator/frame',
    niche: 'Learn · 22k followers',
  },
  {
    handle: 'haze',
    name: 'Haze',
    bio: 'Ambient scores and field recording',
    href: '/creator/haze',
    niche: 'Sound · 15k followers',
    live: true,
  },
  {
    handle: 'grain',
    name: 'Grain',
    bio: 'Tape loops and found footage',
    href: '/creator/grain',
    niche: 'Experimental · underground',
  },
  {
    handle: 'drift',
    name: 'Drift',
    bio: 'Late night live ambient',
    href: '/creator/drift',
    niche: 'Live · 8k followers',
    live: true,
  },
  {
    handle: 'void',
    name: 'Void',
    bio: 'Unlisted experiments',
    href: '/creator/void',
    niche: 'Chaos · niche',
  },
] as const;

export const demoNicheShelf = [
  {
    id: 'n1',
    title: 'Field recording diary',
    creator: '@haze',
    href: '/watch/n1',
    hue: 170,
  },
  {
    id: 'n2',
    title: 'CRT static study',
    creator: '@static',
    href: '/watch/n2',
    hue: 40,
  },
] as const;

export const demoChaosExtended = [
  { id: 'c1', title: 'Signal bleed', creator: '@drift', hue: 130 },
  { id: 'c2', title: 'Unlisted corridor', creator: '@void', hue: 300 },
  { id: 'c3', title: 'Tape loop 7', creator: '@grain', hue: 55 },
  { id: 'c4', title: 'Frequency ghost', creator: '@static', hue: 200 },
  { id: 'c5', title: 'Basement modular', creator: '@patch', hue: 20 },
  { id: 'c6', title: 'Rain channel 4', creator: '@haze', hue: 210 },
] as const;

export const demoInterestClusters = [
  {
    id: 'ic-1',
    label: 'Slow media',
    communities: [
      { slug: 'quiet-signals', name: 'Quiet Signals', href: '/community/quiet-signals' },
      { slug: 'deep-field', name: 'Deep Field', href: '/community/deep-field' },
    ],
  },
  {
    id: 'ic-2',
    label: 'Underground',
    communities: [
      { slug: 'chaos-hour', name: 'Chaos Hour', href: '/community/chaos-hour' },
      { slug: 'tape-hiss', name: 'Tape Hiss', href: '/community/tape-hiss' },
    ],
  },
] as const;
