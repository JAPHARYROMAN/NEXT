'use client';

import clsx from 'clsx';
import { Focusable } from '@next/remote-navigation';

export interface TheaterChapter {
  readonly id: string;
  readonly label: string;
  readonly startSec: number;
}

export interface ChapterNavProps {
  readonly chapters: readonly TheaterChapter[];
  readonly onSelect?: (chapter: TheaterChapter) => void;
  readonly className?: string;
}

export function ChapterNav({ chapters, onSelect, className }: ChapterNavProps) {
  return (
    <nav className={clsx('space-y-3', className)} aria-label="Chapter navigation">
      <p className="text-sm uppercase tracking-widest text-muted">Chapters</p>
      <ul className="space-y-2">
        {chapters.map((ch, i) => (
          <li key={ch.id}>
            <Focusable
              focusId={`ch-${ch.id}`}
              row={i}
              col={0}
              className="w-full text-base"
              onClick={() => onSelect?.(ch)}
            >
              <span className="text-muted">{formatTime(ch.startSec)}</span>
              <span className="ml-3">{ch.label}</span>
            </Focusable>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
