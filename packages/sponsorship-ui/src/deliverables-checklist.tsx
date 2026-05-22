'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface DeliverablesChecklistProps {
  readonly items: readonly { id: string; label: string; completed: boolean }[];
  readonly onToggle?: (id: string) => void;
}

export function DeliverablesChecklist({ items, onToggle }: DeliverablesChecklistProps) {
  return (
    <Surface bordered className="p-5" aria-label="Deliverables checklist">
      <h3 className="text-sm font-medium text-fg">Deliverables</h3>
      <ul className="mt-3 space-y-2" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle?.(item.id)}
                className="rounded border-subtle/30"
              />
              <span className={clsx(item.completed && 'text-muted line-through')}>
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
