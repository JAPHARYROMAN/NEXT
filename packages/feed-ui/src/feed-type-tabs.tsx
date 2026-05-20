'use client';

import clsx from 'clsx';
import type { FeedMode } from '@next/frontend-utils';

export interface FeedTypeTabsProps {
  readonly mode: FeedMode;
  readonly onChange: (mode: FeedMode) => void;
  readonly className?: string;
}

const modes: readonly { id: FeedMode; label: string; description: string }[] = [
  { id: 'precision', label: 'Precision', description: 'Resonant picks for you' },
  { id: 'discovery', label: 'Discovery', description: 'Adjacent interests' },
  { id: 'chaos', label: 'Chaos', description: 'Unexpected culture' },
  { id: 'creator', label: 'Creators', description: 'Voices you follow' },
  { id: 'live', label: 'Live', description: 'Happening now' },
];

export function FeedTypeTabs({ mode, onChange, className }: FeedTypeTabsProps) {
  return (
    <div className={clsx('flex flex-wrap gap-2', className)} role="tablist" aria-label="Feed mode">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          aria-controls={`feed-panel-${m.id}`}
          className={clsx(
            'rounded-full px-4 py-2 text-sm transition-colors',
            mode === m.id
              ? 'bg-accent/15 text-accent font-medium'
              : 'bg-surface/50 text-muted hover:text-foreground',
          )}
          onClick={() => onChange(m.id)}
        >
          <span>{m.label}</span>
          <span className="sr-only"> — {m.description}</span>
        </button>
      ))}
    </div>
  );
}
