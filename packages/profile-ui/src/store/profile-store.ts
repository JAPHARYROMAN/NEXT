import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProfileVisibility = 'public' | 'unlisted' | 'private';

interface ProfileDraftState {
  readonly displayName: string;
  readonly handle: string;
  readonly bio: string;
  readonly avatarPlaceholder: string;
  readonly visibility: ProfileVisibility;
  readonly handleAvailable: boolean | null;
  readonly completionPct: number;
  readonly setDisplayName: (v: string) => void;
  readonly setHandle: (v: string) => void;
  readonly setBio: (v: string) => void;
  readonly setVisibility: (v: ProfileVisibility) => void;
  readonly checkHandle: () => void;
  readonly recomputeCompletion: () => void;
  readonly reset: () => void;
}

function computeCompletion(s: {
  displayName: string;
  handle: string;
  bio: string;
  avatarPlaceholder: string;
}): number {
  let score = 0;
  if (s.displayName.trim().length >= 2) score += 25;
  if (s.handle.trim().length >= 3) score += 25;
  if (s.bio.trim().length >= 10) score += 25;
  if (s.avatarPlaceholder) score += 25;
  return score;
}

const initial = {
  displayName: '',
  handle: '',
  bio: '',
  avatarPlaceholder: 'gradient-aurora',
  visibility: 'public' as ProfileVisibility,
  handleAvailable: null as boolean | null,
  completionPct: 0,
};

export const useProfileDraftStore = create<ProfileDraftState>()(
  persist(
    (set, get) => ({
      ...initial,
      setDisplayName: (displayName) => {
        set({ displayName });
        set({ completionPct: computeCompletion({ ...get(), displayName }) });
      },
      setHandle: (handle) => {
        set({ handle, handleAvailable: null });
        set({ completionPct: computeCompletion({ ...get(), handle }) });
      },
      setBio: (bio) => {
        set({ bio });
        set({ completionPct: computeCompletion({ ...get(), bio }) });
      },
      setVisibility: (visibility) => set({ visibility }),
      checkHandle: () => {
        const h = get().handle.trim();
        const available = h.length >= 3 && /^[a-z0-9_]+$/.test(h) && h !== 'admin';
        set({ handleAvailable: available });
      },
      recomputeCompletion: () => set({ completionPct: computeCompletion(get()) }),
      reset: () => set(initial),
    }),
    { name: 'next-profile-draft-v1' },
  ),
);
