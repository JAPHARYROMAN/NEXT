'use client';

import clsx from 'clsx';
import { CreatorCard } from '@next/ui';

export interface EmergingCreator {
  readonly handle: string;
  readonly name: string;
  readonly bio?: string;
  readonly href: string;
  readonly growthLabel?: string;
}

export interface EmergingCreatorsShelfProps {
  readonly creators: readonly EmergingCreator[];
  readonly className?: string;
}

export function EmergingCreatorsShelf({ creators, className }: EmergingCreatorsShelfProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label="Emerging creators">
      <h2 className="font-display text-xl font-medium">Rising voices</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {creators.map((c) => (
          <div key={c.handle} className="space-y-1">
            <CreatorCard
              handle={c.handle}
              displayName={c.name}
              href={c.href}
              {...(c.bio ? { bio: c.bio } : {})}
              {...(c.growthLabel ? { followerLabel: c.growthLabel } : {})}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
