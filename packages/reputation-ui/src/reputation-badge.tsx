'use client';

import clsx from 'clsx';

export interface ReputationBadgeProps {
  readonly score: number;
  readonly tier?: 'new' | 'trusted' | 'pillar';
  readonly className?: string;
}

const tierLabel = {
  new: 'New voice',
  trusted: 'Trusted',
  pillar: 'Pillar',
} as const;

export function ReputationBadge({ score, tier = 'trusted', className }: ReputationBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1 text-xs',
        className,
      )}
      title={`Reputation score ${score}`}
    >
      <span className="font-medium text-accent">{score}</span>
      <span className="text-muted">{tierLabel[tier]}</span>
    </span>
  );
}
