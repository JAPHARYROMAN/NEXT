import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreatorOnboardingStep } from '../types';

interface CreatorOnboardingState {
  readonly step: CreatorOnboardingStep;
  readonly handle: string;
  readonly displayName: string;
  readonly bio: string;
  readonly categories: string[];
  readonly audienceGoal: string;
  readonly monetizationInterest: boolean;
  readonly studioActivated: boolean;
  readonly verificationPlaceholder: 'none' | 'pending' | 'skipped';
  readonly setStep: (step: CreatorOnboardingStep) => void;
  readonly setIdentity: (handle: string, displayName: string, bio: string) => void;
  readonly toggleCategory: (category: string) => void;
  readonly setAudienceGoal: (goal: string) => void;
  readonly setMonetizationInterest: (enabled: boolean) => void;
  readonly activateStudio: () => void;
  readonly skipVerification: () => void;
  readonly complete: () => void;
  readonly reset: () => void;
}

const initial = {
  step: 'identity' as CreatorOnboardingStep,
  handle: '',
  displayName: '',
  bio: '',
  categories: [] as string[],
  audienceGoal: '',
  monetizationInterest: false,
  studioActivated: false,
  verificationPlaceholder: 'none' as const,
};

export const useCreatorOnboardingStore = create<CreatorOnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setIdentity: (handle, displayName, bio) => set({ handle, displayName, bio }),
      toggleCategory: (category) =>
        set((s) => ({
          categories: s.categories.includes(category)
            ? s.categories.filter((c) => c !== category)
            : [...s.categories, category],
        })),
      setAudienceGoal: (audienceGoal) => set({ audienceGoal }),
      setMonetizationInterest: (monetizationInterest) => set({ monetizationInterest }),
      activateStudio: () => set({ studioActivated: true }),
      skipVerification: () => set({ verificationPlaceholder: 'skipped' }),
      complete: () => set({ step: 'complete' }),
      reset: () => set(initial),
    }),
    { name: 'next-creator-onboarding-v1' },
  ),
);

export function creatorStepIndex(step: CreatorOnboardingStep): number {
  const order: CreatorOnboardingStep[] = [
    'identity',
    'categories',
    'audience',
    'monetization',
    'studio',
    'verification',
    'upload',
    'complete',
  ];
  return order.indexOf(step);
}

export function advanceCreatorStep(current: CreatorOnboardingStep): CreatorOnboardingStep {
  const order: CreatorOnboardingStep[] = [
    'identity',
    'categories',
    'audience',
    'monetization',
    'studio',
    'verification',
    'upload',
    'complete',
  ];
  const i = order.indexOf(current);
  return order[Math.min(i + 1, order.length - 1)] ?? 'complete';
}
