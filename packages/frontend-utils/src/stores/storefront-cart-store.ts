import { create } from 'zustand';

interface StorefrontCartItem {
  readonly productId: string;
  readonly title: string;
  readonly priceLabel: string;
}

interface StorefrontCartState {
  readonly items: readonly StorefrontCartItem[];
  readonly addItem: (item: StorefrontCartItem) => void;
  readonly removeItem: (productId: string) => void;
  readonly clear: () => void;
}

export const useStorefrontCartStore = create<StorefrontCartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: state.items.some((i) => i.productId === item.productId)
        ? state.items
        : [...state.items, item],
    })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  clear: () => set({ items: [] }),
}));

export type { StorefrontCartItem };
