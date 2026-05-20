export type OnboardingPath = 'viewer' | 'creator';

export type UserOnboardingStep =
  | 'profile'
  | 'interests'
  | 'discovery'
  | 'locale'
  | 'privacy'
  | 'notifications'
  | 'feed-prep'
  | 'complete';

export type FeedDiscoveryMode = 'precision' | 'discovery' | 'chaos' | 'balanced';

export type CreatorOnboardingStep =
  | 'identity'
  | 'categories'
  | 'audience'
  | 'monetization'
  | 'studio'
  | 'verification'
  | 'upload'
  | 'complete';

export const USER_ONBOARDING_STEPS: readonly {
  id: UserOnboardingStep;
  label: string;
  optional?: boolean;
}[] = [
  { id: 'profile', label: 'Profile basics' },
  { id: 'interests', label: 'Interests' },
  { id: 'discovery', label: 'Discovery mode' },
  { id: 'locale', label: 'Language & region', optional: true },
  { id: 'privacy', label: 'Privacy', optional: true },
  { id: 'notifications', label: 'Notifications', optional: true },
  { id: 'feed-prep', label: 'First feed' },
  { id: 'complete', label: 'Ready' },
];

export const CREATOR_ONBOARDING_STEPS: readonly {
  id: CreatorOnboardingStep;
  label: string;
  optional?: boolean;
}[] = [
  { id: 'identity', label: 'Creator identity' },
  { id: 'categories', label: 'Content focus' },
  { id: 'audience', label: 'Audience goals' },
  { id: 'monetization', label: 'Monetization', optional: true },
  { id: 'studio', label: 'Studio activation' },
  { id: 'verification', label: 'Verification', optional: true },
  { id: 'upload', label: 'First upload' },
  { id: 'complete', label: 'Launch' },
];

export const DEMO_INTERESTS = [
  'Ambient film',
  'Live music',
  'Indie docs',
  'Design systems',
  'Underground culture',
  'Science & wonder',
  'Slow TV',
  'Creator tools',
] as const;
