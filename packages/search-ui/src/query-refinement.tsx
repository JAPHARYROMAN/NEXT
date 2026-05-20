'use client';

import clsx from 'clsx';

export interface QueryRefinementProps {
  readonly chips: readonly { id: string; label: string }[];
  readonly activeIds?: readonly string[];
  readonly onToggle?: (id: string) => void;
  readonly className?: string;
}

export function QueryRefinement({
  chips,
  activeIds = [],
  onToggle,
  className,
}: QueryRefinementProps) {
  if (chips.length === 0) return null;

  return (
    <div className={clsx('flex flex-wrap gap-2', className)} aria-label="Refine search">
      {chips.map((chip) => {
        const active = activeIds.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={active}
            className={clsx(
              'rounded-full px-3 py-1 text-xs transition-colors',
              active ? 'bg-accent/20 text-accent' : 'bg-surface/60 text-muted hover:bg-surface',
            )}
            onClick={() => onToggle?.(chip.id)}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
