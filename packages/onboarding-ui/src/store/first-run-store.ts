import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingPath } from '../types';

export interface FirstRunSuggestion {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind: 'creator' | 'community' | 'chaos' | 'explore';
}

interface FirstRunState {
  readonly activated: boolean;
  readonly path: OnboardingPath | null;
  readonly viewedFeed: boolean;
  readonly viewedExplore: boolean;
  readonly chaosInvited: boolean;
  readonly studioEntered: boolean;
  readonly uploadPromptSeen: boolean;
  readonly checklistComplete: string[];
  readonly setPath: (path: OnboardingPath) => void;
  readonly activate: () => void;
  readonly markFeedViewed: () => void;
  readonly markExploreViewed: () => void;
  readonly inviteChaos: () => void;
  readonly markStudioEntered: () => void;
  readonly markUploadPrompt: () => void;
  readonly completeChecklistItem: (id: string) => void;
  readonly reset: () => void;
}

export const useFirstRunStore = create<FirstRunState>()(
  persist(
    (set) => ({
      activated: false,
      path: null,
      viewedFeed: false,
      viewedExplore: false,
      chaosInvited: false,
      studioEntered: false,
      uploadPromptSeen: false,
      checklistComplete: [],
      setPath: (path) => set({ path }),
      activate: () => set({ activated: true }),
      markFeedViewed: () => set({ viewedFeed: true }),
      markExploreViewed: () => set({ viewedExplore: true }),
      inviteChaos: () => set({ chaosInvited: true }),
      markStudioEntered: () => set({ studioEntered: true }),
      markUploadPrompt: () => set({ uploadPromptSeen: true }),
      completeChecklistItem: (id) =>
        set((s) => ({
          checklistComplete: s.checklistComplete.includes(id)
            ? s.checklistComplete
            : [...s.checklistComplete, id],
        })),
      reset: () =>
        set({
          activated: false,
          path: null,
          viewedFeed: false,
          viewedExplore: false,
          chaosInvited: false,
          studioEntered: false,
          uploadPromptSeen: false,
          checklistComplete: [],
        }),
    }),
    { name: 'next-first-run-v1' },
  ),
);

export const VIEWER_SUGGESTIONS: readonly FirstRunSuggestion[] = [
  { id: 'feed', label: 'Open your first feed', href: '/feed', kind: 'explore' },
  { id: 'explore', label: 'Explore calmly', href: '/explore', kind: 'explore' },
  { id: 'chaos', label: 'Try chaos mode (optional)', href: '/chaos', kind: 'chaos' },
  { id: 'creators', label: 'Meet creators', href: '/creators', kind: 'creator' },
  { id: 'communities', label: 'Find a community', href: '/communities', kind: 'community' },
];

export const CREATOR_SUGGESTIONS: readonly FirstRunSuggestion[] = [
  { id: 'studio', label: 'Enter NEXT Studio', href: 'http://localhost:3020', kind: 'creator' },
  { id: 'upload', label: 'Prepare first upload', href: '/upload', kind: 'creator' },
  { id: 'profile', label: 'Finish public profile', href: '/profile/setup', kind: 'creator' },
  { id: 'dashboard', label: 'Preview dashboard', href: '/home', kind: 'creator' },
];
