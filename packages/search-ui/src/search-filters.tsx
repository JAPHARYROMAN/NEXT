'use client';

import clsx from 'clsx';
import type { SearchFilters } from './types';

export interface SearchFiltersProps {
  readonly filters: SearchFilters;
  readonly onChange: (filters: SearchFilters) => void;
  readonly className?: string;
}

const durationOptions = [
  { value: undefined, label: 'Any length' },
  { value: 'short' as const, label: 'Short' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'long' as const, label: 'Long' },
];

const recencyOptions = [
  { value: undefined, label: 'Any time' },
  { value: 'day' as const, label: 'Today' },
  { value: 'week' as const, label: 'This week' },
  { value: 'month' as const, label: 'This month' },
];

export function SearchFiltersPanel({ filters, onChange, className }: SearchFiltersProps) {
  return (
    <aside className={clsx('flex flex-wrap gap-3 text-sm', className)} aria-label="Search filters">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Duration</legend>
        {durationOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            aria-pressed={filters.duration === opt.value}
            className={clsx(
              'rounded-lg px-3 py-1',
              filters.duration === opt.value ? 'bg-surface text-fg' : 'text-muted hover:text-fg',
            )}
            onClick={() => {
              const next = { ...filters };
              if (opt.value) next.duration = opt.value;
              else delete next.duration;
              onChange(next);
            }}
          >
            {opt.label}
          </button>
        ))}
      </fieldset>
      <span className="text-subtle/30" aria-hidden>
        ·
      </span>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Recency</legend>
        {recencyOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            aria-pressed={filters.recency === opt.value}
            className={clsx(
              'rounded-lg px-3 py-1',
              filters.recency === opt.value ? 'bg-surface text-fg' : 'text-muted hover:text-fg',
            )}
            onClick={() => {
              const next = { ...filters };
              if (opt.value) next.recency = opt.value;
              else delete next.recency;
              onChange(next);
            }}
          >
            {opt.label}
          </button>
        ))}
      </fieldset>
    </aside>
  );
}
