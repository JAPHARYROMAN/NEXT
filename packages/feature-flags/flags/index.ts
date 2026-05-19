// Typed flag registry. CI enforces that every flag referenced in code exists here.
// Stale flags (added > 90 days ago and unused) are reported in CI but not failed.

export interface FlagDef<T = unknown> {
  readonly key: string;
  readonly description: string;
  readonly owner: string; // GitHub team
  readonly defaultValue: T;
  readonly addedAt: string; // ISO date
  readonly removeAfter?: string; // ISO date
}

export const FLAGS = {
  'feed.muted-creators': {
    key: 'feed.muted-creators',
    description: 'Hide videos from muted creators in the personalized feed.',
    owner: '@next-ecosystem/feed',
    defaultValue: false,
    addedAt: '2026-05-19',
  },
  'rec.two-tower-v2': {
    key: 'rec.two-tower-v2',
    description: 'Shadow / canary of the v2 two-tower candidate generator.',
    owner: '@next-ecosystem/ml-discovery',
    defaultValue: false,
    addedAt: '2026-05-19',
  },
  'live.glass-to-glass-ll-hls': {
    key: 'live.glass-to-glass-ll-hls',
    description: 'Use LL-HLS for live playback (vs LL-DASH).',
    owner: '@next-ecosystem/streaming',
    defaultValue: false,
    addedAt: '2026-05-19',
  },
  'commerce.tipping': {
    key: 'commerce.tipping',
    description: 'Enable creator tipping on video pages.',
    owner: '@next-ecosystem/payments',
    defaultValue: false,
    addedAt: '2026-05-19',
  },
} as const satisfies Record<string, FlagDef>;

export type FlagKey = keyof typeof FLAGS;
