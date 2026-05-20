'use client';

import clsx from 'clsx';
import { Badge, Surface } from '@next/ui';
import type { PreflightItem } from './types';

export interface PreflightChecklistProps {
  readonly items: readonly PreflightItem[];
  readonly className?: string;
}

export function PreflightChecklist({ items, className }: PreflightChecklistProps) {
  const passed = items.filter((i) => i.passed).length;

  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Preflight checklist">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Readiness</h3>
        <Badge tone={passed === items.length ? 'success' : 'accent'}>
          {passed}/{items.length}
        </Badge>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={clsx(
              'flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm',
              item.passed ? 'text-fg' : 'text-muted',
            )}
          >
            <span aria-hidden>{item.passed ? '✓' : '○'}</span>
            <div>
              <p>{item.label}</p>
              {item.detail ? <p className="text-xs text-muted">{item.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
