'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface ReplayChapter {
  readonly id: string;
  readonly label: string;
  readonly atSec: number;
}

export interface ReplayChapterMarkersProps {
  readonly chapters: readonly ReplayChapter[];
  readonly className?: string;
}

export function ReplayChapterMarkers({ chapters, className }: ReplayChapterMarkersProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Replay chapters">
      <h3 className="text-sm font-medium">Chapters</h3>
      <ol className="mt-3 space-y-2 text-sm">
        {chapters.map((c) => (
          <li key={c.id} className="flex justify-between rounded-lg bg-surface/40 px-3 py-2">
            <span>{c.label}</span>
            <span className="tabular-nums text-muted">{formatTime(c.atSec)}</span>
          </li>
        ))}
      </ol>
    </Surface>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
