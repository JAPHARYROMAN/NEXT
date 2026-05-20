'use client';

import clsx from 'clsx';
import { CommunityCard } from '@next/ui';

export interface DiscoverableCommunity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: string;
  readonly href: string;
  readonly mood?: 'calm' | 'chaos' | 'learn';
}

export interface CommunityDiscoveryGridProps {
  readonly communities: readonly DiscoverableCommunity[];
  readonly title?: string;
  readonly className?: string;
}

export function CommunityDiscoveryGrid({
  communities,
  title = 'Communities to explore',
  className,
}: CommunityDiscoveryGridProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label={title}>
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((c) => (
          <li key={c.id}>
            <CommunityCard {...c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
