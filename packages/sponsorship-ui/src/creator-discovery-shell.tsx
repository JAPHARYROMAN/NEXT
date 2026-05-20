'use client';

import { Surface } from '@next/ui';

export interface CreatorDiscoveryShellProps {
  readonly creators: readonly {
    handle: string;
    niche: string;
    fitScore: number;
    audienceLabel: string;
  }[];
  readonly onSelect?: (handle: string) => void;
}

export function CreatorDiscoveryShell({ creators, onSelect }: CreatorDiscoveryShellProps) {
  return (
    <Surface bordered className="p-5" aria-label="Creator discovery">
      <h3 className="text-sm font-medium text-fg">Discover creators</h3>
      <ul className="mt-4 space-y-3" role="list">
        {creators.map((creator) => (
          <li
            key={creator.handle}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-subtle/10 px-3 py-2"
          >
            <div>
              <p className="text-sm text-fg">@{creator.handle}</p>
              <p className="text-xs text-muted">
                {creator.niche} · {creator.audienceLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelect?.(creator.handle)}
              className="text-xs text-accent hover:underline"
            >
              Fit {creator.fitScore}%
            </button>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
