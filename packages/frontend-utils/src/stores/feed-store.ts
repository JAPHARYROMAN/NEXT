import { create } from 'zustand';

export interface FeedItem {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly thumbnailHue: number;
}

interface FeedState {
  readonly items: readonly FeedItem[];
  readonly cursor: string | null;
  readonly setItems: (items: readonly FeedItem[]) => void;
  readonly append: (items: readonly FeedItem[]) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  cursor: null,
  setItems: (items) => set({ items, cursor: items.at(-1)?.id ?? null }),
  append: (items) =>
    set((s) => ({
      items: [...s.items, ...items],
      cursor: items.at(-1)?.id ?? s.cursor,
    })),
}));
