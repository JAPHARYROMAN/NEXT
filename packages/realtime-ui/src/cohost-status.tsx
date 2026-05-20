'use client';

import clsx from 'clsx';
import { Badge } from '@next/ui';

export interface CoHostState {
  readonly id: string;
  readonly name: string;
  readonly role: 'host' | 'cohost' | 'guest';
  readonly connected: boolean;
}

export interface CohostStatusProps {
  readonly hosts: readonly CoHostState[];
  readonly className?: string;
}

export function CohostStatus({ hosts, className }: CohostStatusProps) {
  return (
    <ul className={clsx('space-y-2 text-sm', className)} aria-label="Stage participants">
      {hosts.map((h) => (
        <li
          key={h.id}
          className="flex items-center justify-between rounded-lg bg-surface/40 px-3 py-2"
        >
          <span>{h.name}</span>
          <div className="flex items-center gap-2">
            <Badge tone="accent">{h.role}</Badge>
            <Badge tone={h.connected ? 'success' : 'danger'}>
              {h.connected ? 'live' : 'offline'}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
