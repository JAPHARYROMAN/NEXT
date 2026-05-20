'use client';

import clsx from 'clsx';
import { CreatorCard } from '@next/ui';
import { Badge } from '@next/ui';

export interface RisingCreatorCardProps {
  readonly handle: string;
  readonly name: string;
  readonly niche: string;
  readonly growthLabel: string;
  readonly href: string;
  readonly className?: string;
}

export function RisingCreatorCard({
  handle,
  name,
  niche,
  growthLabel,
  href,
  className,
}: RisingCreatorCardProps) {
  return (
    <article className={clsx('relative', className)}>
      <Badge tone="accent" className="absolute -top-2 right-2 z-10">
        Rising
      </Badge>
      <CreatorCard
        handle={handle}
        displayName={name}
        href={href}
        bio={niche}
        followerLabel={growthLabel}
      />
    </article>
  );
}
