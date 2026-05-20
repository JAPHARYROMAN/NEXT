import type { Chapter } from '@next/media-ui';
import type { FeedItem, MediaKind } from '@next/frontend-utils';

export interface WatchMedia extends FeedItem {
  readonly kind: MediaKind;
  readonly durationSec: number;
  readonly description: string;
}

export const demoWatchById: Record<string, WatchMedia> = {
  '1': {
    id: '1',
    title: 'Signals in the quiet city',
    creator: '@lumen',
    thumbnailHue: 210,
    kind: 'long',
    durationSec: 1240,
    description: 'A slow cinematic essay on urban silence and light.',
  },
  '2': {
    id: '2',
    title: 'How we shape discovery without control',
    creator: '@next',
    thumbnailHue: 16,
    kind: 'long',
    durationSec: 890,
    description: 'Design philosophy for human-centered recommendation.',
  },
  '3': {
    id: '3',
    title: 'Live from the underground stage',
    creator: '@vault',
    thumbnailHue: 280,
    kind: 'live',
    durationSec: 0,
    description: 'Realtime performance — placeholder stream.',
  },
  '4': {
    id: '4',
    title: 'A field guide to cinematic pacing',
    creator: '@frame',
    thumbnailHue: 45,
    kind: 'short',
    durationSec: 58,
    description: 'Short-form craft notes for editors.',
  },
  '5': {
    id: '5',
    title: 'Chaos hour — unlisted experiments',
    creator: '@drift',
    thumbnailHue: 130,
    kind: 'clip',
    durationSec: 42,
    description: 'Fragment from the chaos discovery lane.',
  },
};

export const demoChapters: readonly Chapter[] = [
  { id: 'intro', label: 'Opening', startSec: 0 },
  { id: 'pulse', label: 'Pulse', startSec: 120 },
  { id: 'drift', label: 'Drift', startSec: 480 },
  { id: 'close', label: 'Closing', startSec: 900 },
];

export const demoRelated: readonly FeedItem[] = [
  { id: '6', title: 'Studio session: ambient scoring', creator: '@haze', thumbnailHue: 190 },
  { id: '4', title: 'A field guide to cinematic pacing', creator: '@frame', thumbnailHue: 45 },
];
