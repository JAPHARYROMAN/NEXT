'use client';

import clsx from 'clsx';

export interface TimelineEntry {
  readonly id: string;
  readonly label: string;
  readonly time: string;
  readonly kind?: 'discussion' | 'media' | 'ritual' | 'announcement';
}

export interface ActivityTimelineProps {
  readonly entries: readonly TimelineEntry[];
  readonly className?: string;
}

export function ActivityTimeline({ entries, className }: ActivityTimelineProps) {
  return (
    <section className={clsx('space-y-3', className)} aria-label="Community activity">
      <h3 className="text-sm font-medium text-muted">Recent resonance</h3>
      <ol className="space-y-2 border-l border-subtle/20 pl-4">
        {entries.map((entry) => (
          <li key={entry.id} className="relative text-sm">
            <span
              className="absolute -left-[1.125rem] top-1.5 h-2 w-2 rounded-full bg-accent/60"
              aria-hidden
            />
            <p className="text-foreground">{entry.label}</p>
            <p className="text-xs text-subtle">
              {entry.time}
              {entry.kind ? ` · ${entry.kind}` : ''}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
