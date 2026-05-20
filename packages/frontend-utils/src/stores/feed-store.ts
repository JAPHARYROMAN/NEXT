import { create } from 'zustand';

export interface FeedItem {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly thumbnailHue: number;
}

export type FeedMode = 'precision' | 'discovery' | 'chaos' | 'creator' | 'live';
export type FeedDensity = 'comfortable' | 'compact' | 'immersive';

interface FeedState {
  readonly items: readonly FeedItem[];
  readonly cursor: string | null;
  readonly mode: FeedMode;
  readonly density: FeedDensity;
  readonly setMode: (mode: FeedMode) => void;
  readonly setDensity: (density: FeedDensity) => void;
  readonly setItems: (items: readonly FeedItem[]) => void;
  readonly append: (items: readonly FeedItem[]) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  cursor: null,
  mode: 'precision',
  density: 'comfortable',
  setMode: (mode) => set({ mode }),
  setDensity: (density) => set({ density }),
  setItems: (items) => set({ items, cursor: items.at(-1)?.id ?? null }),
  append: (items) =>
    set((s) => ({
      items: [...s.items, ...items],
      cursor: items.at(-1)?.id ?? s.cursor,
    })),
}));
