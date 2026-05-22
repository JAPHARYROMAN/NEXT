'use client';

import clsx from 'clsx';

export interface CommunityHealthProps {
  readonly score: number;
  readonly signals?: readonly string[];
  readonly className?: string;
}

export function CommunityHealth({ score, signals = [], className }: CommunityHealthProps) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <section className={clsx('space-y-2', className)} aria-label="Community health">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">Health indicator</span>
        <span className="font-medium text-accent">{pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      {signals.length > 0 ? (
        <ul className="space-y-1 text-xs text-subtle">
          {signals.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
