import { create } from 'zustand';

export type OnboardingStep = 'intro' | 'prefs' | 'member';

export interface NotificationPrefsShell {
  readonly rituals: boolean;
  readonly mentions: boolean;
  readonly digest: boolean;
}

interface CommunityOnboardingState {
  readonly step: OnboardingStep;
  readonly notificationPrefs: NotificationPrefsShell;
  readonly setStep: (step: OnboardingStep) => void;
  readonly reset: () => void;
}

const defaultPrefs: NotificationPrefsShell = {
  rituals: true,
  mentions: true,
  digest: false,
};

export const useCommunityOnboardingStore = create<CommunityOnboardingState>((set) => ({
  step: 'intro',
  notificationPrefs: defaultPrefs,
  setStep: (step) => set({ step }),
  reset: () => set({ step: 'intro', notificationPrefs: defaultPrefs }),
}));
