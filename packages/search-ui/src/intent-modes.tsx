'use client';

import clsx from 'clsx';
import type { SearchIntent } from './types';

export interface IntentModesProps {
  readonly active: SearchIntent;
  readonly onChange: (intent: SearchIntent) => void;
  readonly className?: string;
}

const intents: readonly { id: SearchIntent; label: string; hint: string }[] = [
  { id: 'exact', label: 'Exact', hint: 'Precise matches' },
  { id: 'explore', label: 'Explore', hint: 'Expand curiosity' },
  { id: 'chaos', label: 'Chaos', hint: 'Unexpected finds' },
  { id: 'learn', label: 'Learn', hint: 'Craft & technique' },
  { id: 'creators', label: 'Creators', hint: 'People & voices' },
  { id: 'communities', label: 'Communities', hint: 'Gathering spaces' },
  { id: 'live', label: 'Live', hint: 'Happening now' },
];

export function IntentModes({ active, onChange, className }: IntentModesProps) {
  return (
    <div
      className={clsx('flex flex-wrap gap-2', className)}
      role="tablist"
      aria-label="Search intent"
    >
      {intents.map((intent) => (
        <button
          key={intent.id}
          type="button"
          role="tab"
          aria-selected={active === intent.id}
          title={intent.hint}
          className={clsx(
            'rounded-full px-4 py-1.5 text-sm transition-colors',
            active === intent.id
              ? 'bg-accent text-bg'
              : 'border border-subtle/20 text-muted hover:border-subtle/40',
          )}
          onClick={() => onChange(intent.id)}
        >
          {intent.label}
        </button>
      ))}
    </div>
  );
}
