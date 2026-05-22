export interface LiveStream {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly viewers: number;
  readonly hue: number;
  readonly status: 'live' | 'starting' | 'ended' | 'replay';
  readonly category?: string;
}

export interface LiveEvent {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly startsInSec: number;
  readonly premiere?: boolean;
  readonly streamId?: string;
  readonly highlights: readonly string[];
}

export interface LiveChatDemo {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly highlight?: boolean;
}

export const demoLiveStreams: readonly [LiveStream, ...LiveStream[]] = [
  {
    id: 'live-1',
    title: 'Underground stage — night set',
    creator: '@vault',
    viewers: 2840,
    hue: 280,
    status: 'live',
    category: 'Music',
  },
  {
    id: 'live-2',
    title: 'Open studio Q&A',
    creator: '@next',
    viewers: 412,
    hue: 16,
    status: 'live',
    category: 'Talk',
  },
  {
    id: 'live-3',
    title: 'Ambient jam session',
    creator: '@haze',
    viewers: 156,
    hue: 190,
    status: 'live',
    category: 'Ambient',
  },
  {
    id: 'live-ended',
    title: 'Archive — sunrise set',
    creator: '@vault',
    viewers: 0,
    hue: 40,
    status: 'ended',
    category: 'Music',
  },
];

export const demoLiveEvents: readonly [LiveEvent, ...LiveEvent[]] = [
  {
    id: 'evt-premiere',
    title: 'Premiere — Field recordings vol. 2',
    creator: '@haze',
    startsInSec: 3720,
    premiere: true,
    streamId: 'live-3',
    highlights: ['Spatial audio mix', 'Creator Q&A after'],
  },
  {
    id: 'evt-community',
    title: 'Community listening room',
    creator: '@next',
    startsInSec: 900,
    highlights: ['Watch party bridge', 'Calm chat defaults'],
  },
];

export const demoLiveChat: readonly LiveChatDemo[] = [
  { id: '1', author: 'Sam', body: 'The lighting shift at 12:04 ✦', highlight: true },
  { id: '2', author: 'Riley', body: 'Beautiful pacing.' },
  { id: '3', author: 'Mod', body: 'Slow mode on — take your time.', highlight: false },
];

export const demoReplayChapters = [
  { id: 'c1', label: 'Opening', atSec: 0 },
  { id: 'c2', label: 'Peak moment', atSec: 724 },
  { id: 'c3', label: 'Closing gratitude', atSec: 2100 },
] as const;

export const demoLiveQuestions = [
  { id: 'q1', author: '@lee', body: 'What mic chain are you using?', votes: 12 },
  { id: 'q2', author: '@mira', body: 'Will this become a series?', votes: 8 },
] as const;
