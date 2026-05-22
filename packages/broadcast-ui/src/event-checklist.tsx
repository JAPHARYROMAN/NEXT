'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface EventChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
}

export interface EventChecklistProps {
  readonly items: readonly EventChecklistItem[];
  readonly className?: string;
}

export function EventChecklist({ items, className }: EventChecklistProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Event checklist">
      <h3 className="text-sm font-medium">Event checklist</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <input type="checkbox" readOnly checked={item.done} aria-label={item.label} />
            <span className={item.done ? 'text-muted line-through' : undefined}>{item.label}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
