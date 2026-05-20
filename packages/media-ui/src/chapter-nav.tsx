'use client';

import clsx from 'clsx';

export interface Chapter {
  readonly id: string;
  readonly label: string;
  readonly startSec: number;
}

export interface ChapterNavProps {
  readonly chapters: readonly Chapter[];
  readonly activeId?: string;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function ChapterNav({ chapters, activeId, onSelect, className }: ChapterNavProps) {
  return (
    <nav className={clsx('space-y-1', className)} aria-label="Chapters">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Chapters</p>
      <ol className="space-y-1">
        {chapters.map((ch) => (
          <li key={ch.id}>
            <button
              type="button"
              className={clsx(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                activeId === ch.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-surface/60 hover:text-foreground',
              )}
              onClick={() => onSelect?.(ch.id)}
              aria-current={activeId === ch.id ? 'true' : undefined}
            >
              <span className="font-medium">{ch.label}</span>
              <span className="ml-2 tabular-nums text-xs text-muted">
                {formatTime(ch.startSec)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
