'use client';

import { Surface } from '@next/ui';

export interface ActivityItem {
  readonly id: string;
  readonly message: string;
  readonly at: string;
}

export interface ActivityFeedProps {
  readonly items: readonly ActivityItem[];
  readonly title?: string;
}

export function ActivityFeed({ items, title = 'Realtime activity' }: ActivityFeedProps) {
  return (
    <Surface bordered className="p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-4 space-y-3" aria-live="polite">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span>{item.message}</span>
            <time className="shrink-0 text-xs text-muted">{item.at}</time>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
