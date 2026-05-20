import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedDiscoveryMode, OnboardingPath, UserOnboardingStep } from '../types';

export interface NotificationOnboardingPrefs {
  readonly digest: boolean;
  readonly live: boolean;
  readonly community: boolean;
}

interface OnboardingState {
  readonly path: OnboardingPath | null;
  readonly welcomeComplete: boolean;
  readonly userStep: UserOnboardingStep;
  readonly displayName: string;
  readonly interests: string[];
  readonly discoveryMode: FeedDiscoveryMode;
  readonly language: string;
  readonly region: string;
  readonly chaosOptIn: boolean;
  readonly personalizationLevel: number;
  readonly notificationPrefs: NotificationOnboardingPrefs;
  readonly feedPrepared: boolean;
  readonly completedAt: number | null;
  readonly setPath: (path: OnboardingPath) => void;
  readonly completeWelcome: () => void;
  readonly setUserStep: (step: UserOnboardingStep) => void;
  readonly setDisplayName: (name: string) => void;
  readonly toggleInterest: (interest: string) => void;
  readonly setDiscoveryMode: (mode: FeedDiscoveryMode) => void;
  readonly setLocale: (language: string, region: string) => void;
  readonly setChaosOptIn: (enabled: boolean) => void;
  readonly setPersonalizationLevel: (level: number) => void;
  readonly setNotificationPrefs: (prefs: Partial<NotificationOnboardingPrefs>) => void;
  readonly markFeedPrepared: () => void;
  readonly completeOnboarding: () => void;
  readonly reset: () => void;
}

const defaultNotifications: NotificationOnboardingPrefs = {
  digest: false,
  live: true,
  community: true,
};

const initial = {
  path: null as OnboardingPath | null,
  welcomeComplete: false,
  userStep: 'profile' as UserOnboardingStep,
  displayName: '',
  interests: [] as string[],
  discoveryMode: 'balanced' as FeedDiscoveryMode,
  language: 'en',
  region: 'US',
  chaosOptIn: false,
  personalizationLevel: 60,
  notificationPrefs: defaultNotifications,
  feedPrepared: false,
  completedAt: null as number | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setPath: (path) => set({ path }),
      completeWelcome: () => set({ welcomeComplete: true }),
      setUserStep: (userStep) => set({ userStep }),
      setDisplayName: (displayName) => set({ displayName }),
      toggleInterest: (interest) =>
        set((s) => ({
          interests: s.interests.includes(interest)
            ? s.interests.filter((i) => i !== interest)
            : [...s.interests, interest],
        })),
      setDiscoveryMode: (discoveryMode) => set({ discoveryMode }),
      setLocale: (language, region) => set({ language, region }),
      setChaosOptIn: (chaosOptIn) => set({ chaosOptIn }),
      setPersonalizationLevel: (personalizationLevel) => set({ personalizationLevel }),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
      markFeedPrepared: () => set({ feedPrepared: true }),
      completeOnboarding: () =>
        set({ completedAt: Date.now(), userStep: 'complete', feedPrepared: true }),
      reset: () => set(initial),
    }),
    { name: 'next-onboarding-v1' },
  ),
);

export function userStepIndex(step: UserOnboardingStep): number {
  const order: UserOnboardingStep[] = [
    'profile',
    'interests',
    'discovery',
    'locale',
    'privacy',
    'notifications',
    'feed-prep',
    'complete',
  ];
  return order.indexOf(step);
}

export function advanceUserStep(current: UserOnboardingStep): UserOnboardingStep {
  const order: UserOnboardingStep[] = [
    'profile',
    'interests',
    'discovery',
    'locale',
    'privacy',
    'notifications',
    'feed-prep',
    'complete',
  ];
  const i = order.indexOf(current);
  return order[Math.min(i + 1, order.length - 1)] ?? 'complete';
}

export function retreatUserStep(current: UserOnboardingStep): UserOnboardingStep {
  const order: UserOnboardingStep[] = [
    'profile',
    'interests',
    'discovery',
    'locale',
    'privacy',
    'notifications',
    'feed-prep',
    'complete',
  ];
  const i = order.indexOf(current);
  return order[Math.max(i - 1, 0)] ?? 'profile';
}
