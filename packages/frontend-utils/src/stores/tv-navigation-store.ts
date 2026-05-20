import { create } from 'zustand';

export type TvNavSurface = 'home' | 'discovery' | 'watch' | 'party' | 'live' | 'chaos';

interface TvNavigationState {
  readonly surface: TvNavSurface;
  readonly focusedShelf: string | null;
  readonly focusMemory: Record<string, string>;
  readonly overlayOpen: boolean;
  readonly setSurface: (surface: TvNavSurface) => void;
  readonly setFocusedShelf: (shelf: string | null) => void;
  readonly rememberFocus: (zone: string, focusId: string) => void;
  readonly recallFocus: (zone: string) => string | undefined;
  readonly setOverlayOpen: (open: boolean) => void;
}

export const useTvNavigationStore = create<TvNavigationState>((set, get) => ({
  surface: 'home',
  focusedShelf: null,
  focusMemory: {},
  overlayOpen: false,
  setSurface: (surface) => set({ surface }),
  setFocusedShelf: (focusedShelf) => set({ focusedShelf }),
  rememberFocus: (zone, focusId) =>
    set((s) => ({ focusMemory: { ...s.focusMemory, [zone]: focusId } })),
  recallFocus: (zone) => get().focusMemory[zone],
  setOverlayOpen: (overlayOpen) => set({ overlayOpen }),
}));
