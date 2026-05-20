import type { FeedItem } from '@next/frontend-utils';

export interface LibrarySection {
  readonly id: string;
  readonly title: string;
  readonly items: readonly FeedItem[];
}

export const demoLibrarySections: readonly LibrarySection[] = [
  {
    id: 'saved',
    title: 'Saved',
    items: [
      { id: '1', title: 'Signals in the quiet city', creator: '@lumen', thumbnailHue: 210 },
      { id: '4', title: 'A field guide to cinematic pacing', creator: '@frame', thumbnailHue: 45 },
    ],
  },
  {
    id: 'history',
    title: 'Watch history',
    items: [
      {
        id: '2',
        title: 'How we shape discovery without control',
        creator: '@next',
        thumbnailHue: 16,
      },
      { id: '3', title: 'Live from the underground stage', creator: '@vault', thumbnailHue: 280 },
    ],
  },
  {
    id: 'playlists',
    title: 'Playlists',
    items: [
      { id: '6', title: 'Studio session: ambient scoring', creator: '@haze', thumbnailHue: 190 },
    ],
  },
];
