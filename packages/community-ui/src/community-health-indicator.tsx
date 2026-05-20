'use client';

import clsx from 'clsx';

export interface CommunityHealthIndicatorProps {
  readonly score: number;
  readonly className?: string;
}

function healthLabel(score: number): string {
  if (score >= 0.8) return 'Thriving';
  if (score >= 0.5) return 'Healthy';
  return 'Emerging';
}

function healthColor(score: number): string {
  if (score >= 0.8) return 'bg-success';
  if (score >= 0.5) return 'bg-accent';
  return 'bg-amber-500';
}

export function CommunityHealthIndicator({ score, className }: CommunityHealthIndicatorProps) {
  const pct = Math.round(score * 100);

  return (
    <div
      className={clsx('flex items-center gap-2 text-xs text-muted', className)}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Community health: ${healthLabel(score)}`}
    >
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
        <div
          className={clsx('h-full rounded-full transition-all', healthColor(score))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{healthLabel(score)}</span>
    </div>
  );
}
