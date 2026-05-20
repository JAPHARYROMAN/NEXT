'use client';

import clsx from 'clsx';
import { focusRing } from '@next/design-system';

export interface EmergingCommunityCardProps {
  readonly name: string;
  readonly niche: string;
  readonly growthLabel: string;
  readonly href: string;
  readonly className?: string;
}

export function EmergingCommunityCard({
  name,
  niche,
  growthLabel,
  href,
  className,
}: EmergingCommunityCardProps) {
  return (
    <article
      className={clsx(
        'rounded-xl border border-dashed border-accent/25 bg-accent/5 p-4',
        className,
      )}
    >
      <a href={href} className={clsx('block space-y-2', focusRing)}>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Emerging</p>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-muted">{niche}</p>
        <p className="text-xs text-subtle">{growthLabel}</p>
      </a>
    </article>
  );
}
