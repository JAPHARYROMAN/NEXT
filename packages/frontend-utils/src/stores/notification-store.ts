import { create } from 'zustand';

export interface NotificationItem {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly read: boolean;
  readonly createdAt: string;
}

interface NotificationState {
  readonly items: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly setItems: (items: readonly NotificationItem[]) => void;
  readonly markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  setItems: (items) =>
    set({
      items,
      unreadCount: items.filter((n) => !n.read).length,
    }),
  markRead: (id) =>
    set((s) => {
      const items = s.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),
}));
