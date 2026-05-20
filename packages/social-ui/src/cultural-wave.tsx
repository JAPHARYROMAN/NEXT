'use client';

import clsx from 'clsx';

export interface CulturalWaveItem {
  readonly id: string;
  readonly label: string;
  readonly intensity: number;
}

export interface CulturalWaveProps {
  readonly waves: readonly CulturalWaveItem[];
  readonly activeId?: string;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function CulturalWave({ waves, activeId, onSelect, className }: CulturalWaveProps) {
  return (
    <nav className={clsx('space-y-2', className)} aria-label="Cultural waves">
      <h3 className="text-sm font-medium text-muted">Cultural waves</h3>
      <ul className="flex flex-col gap-1">
        {waves.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => onSelect?.(w.id)}
              className={clsx(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                activeId === w.id ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-surface/60',
              )}
              aria-current={activeId === w.id ? 'true' : undefined}
            >
              {w.label}
              <span className="ml-2 text-xs opacity-60">{Math.round(w.intensity * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
