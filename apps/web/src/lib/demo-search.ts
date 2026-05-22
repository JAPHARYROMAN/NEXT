import type { SearchResultSection } from '@next/search-ui';

export const demoSearchSuggestions = [
  { id: 's1', label: 'ambient night walks', intent: 'explore' as const },
  { id: 's2', label: 'underground live sets', intent: 'live' as const },
  { id: 's3', label: 'generative art tutorials', intent: 'learn' as const },
  { id: 's4', label: 'small room acoustic', intent: 'chaos' as const },
] as const;

export const demoRefinementChips = [
  { id: 'r1', label: 'Slow cinema' },
  { id: 'r2', label: 'Field recording' },
  { id: 'r3', label: 'Lo-fi' },
  { id: 'r4', label: 'Experimental' },
] as const;

export function buildDemoSearchResults(query: string): readonly SearchResultSection[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const sections: SearchResultSection[] = [];

  const mediaItems = [
    {
      kind: 'media' as const,
      id: 'm1',
      title: 'Midnight corridor study',
      creator: '@lumen',
      href: '/watch/m1',
      hue: 220,
    },
    {
      kind: 'media' as const,
      id: 'm2',
      title: 'Rain on glass — extended',
      creator: '@haze',
      href: '/watch/m2',
      hue: 200,
    },
  ].filter(() => !q || q.includes('night') || q.includes('ambient') || q.includes('rain'));

  if (mediaItems.length) sections.push({ id: 'media', title: 'Media', items: mediaItems });

  sections.push({
    id: 'creators',
    title: 'Creators',
    items: [
      {
        kind: 'creator',
        handle: 'lumen',
        name: 'Lumen',
        bio: 'Slow reveals and urban nightscapes',
        href: '/creator/lumen',
      },
      {
        kind: 'creator',
        handle: 'grain',
        name: 'Grain',
        bio: 'Tape loops and found footage',
        href: '/creator/grain',
        ...(q.includes('live') ? { live: true } : {}),
      },
    ],
  });

  sections.push({
    id: 'communities',
    title: 'Communities',
    items: [
      {
        kind: 'community',
        slug: 'quiet-signals',
        name: 'Quiet Signals',
        description: 'Slow cinema and ambient scores',
        memberCount: '12.4k',
        href: '/community/quiet-signals',
        mood: 'calm' as const,
      },
    ],
  });

  if (q.includes('live') || q.includes('ambient')) {
    sections.push({
      id: 'live',
      title: 'Live now',
      items: [
        {
          kind: 'live',
          id: 'live-1',
          title: 'Late night ambient session',
          creator: '@drift',
          viewerLabel: '842 watching',
          href: '/live/live-1',
          hue: 280,
        },
      ],
    });
  }

  sections.push({
    id: 'topics',
    title: 'Topic clusters',
    items: [
      { kind: 'topic', id: 't1', label: 'Urban night', relation: 'near' as const, resultCount: 48 },
      {
        kind: 'topic',
        id: 't2',
        label: 'Generative art',
        relation: 'far' as const,
        resultCount: 12,
      },
      {
        kind: 'topic',
        id: 't3',
        label: 'Found footage',
        relation: 'wild' as const,
        resultCount: 7,
      },
    ],
  });

  return sections;
}
