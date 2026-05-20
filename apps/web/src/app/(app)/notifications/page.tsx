'use client';

import { useEffect } from 'react';
import { Surface } from '@next/ui';
import { useNotificationStore } from '@next/frontend-utils';

const demoNotifications = [
  {
    id: 'n1',
    title: 'New resonance',
    body: 'Your piece was saved into three discovery paths.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Live reminder',
    body: 'Underground stage opens in 2 hours.',
    read: true,
    createdAt: new Date().toISOString(),
  },
];

export default function NotificationsPage() {
  const items = useNotificationStore((s) => s.items);
  const setItems = useNotificationStore((s) => s.setItems);
  const markRead = useNotificationStore((s) => s.markRead);

  useEffect(() => {
    if (items.length === 0) setItems(demoNotifications);
  }, [items.length, setItems]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Notifications</h1>
      {items.map((n) => (
        <Surface key={n.id} bordered className="p-4">
          <button type="button" className="w-full text-left" onClick={() => markRead(n.id)}>
            <p className="font-medium">{n.title}</p>
            <p className="mt-1 text-sm text-muted">{n.body}</p>
          </button>
        </Surface>
      ))}
    </div>
  );
}
