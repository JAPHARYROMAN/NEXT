'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { MutedUser } from './types';

export interface MutedUsersPanelProps {
  readonly users: readonly MutedUser[];
  readonly className?: string;
}

export function MutedUsersPanel({ users, className }: MutedUsersPanelProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Muted users">
      <h3 className="text-sm font-medium">Muted users</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {users.map((u) => (
          <li key={u.id} className="flex justify-between rounded-lg bg-surface/40 px-3 py-2">
            <span>{u.handle}</span>
            <span className="text-xs text-muted">{u.until ?? 'session'}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
