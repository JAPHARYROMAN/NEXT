'use client';

import { Surface } from '@next/ui';

export interface WatchPartyShellProps {
  readonly title: string;
  readonly participants: readonly string[];
}

export function WatchPartyShell({ title, participants }: WatchPartyShellProps) {
  return (
    <Surface bordered className="p-5" role="region" aria-label={`Watch party: ${title}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs text-muted">{participants.length} watching together</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {participants.map((p) => (
          <li key={p} className="rounded-full bg-elevated px-3 py-1 text-xs text-muted">
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">Realtime sync overlay — placeholder.</p>
    </Surface>
  );
}
