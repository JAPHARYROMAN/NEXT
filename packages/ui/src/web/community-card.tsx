'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { focusRing } from '@next/design-system';
import { Badge } from './badge';

export interface CommunityCardProps {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: string;
  readonly href: string;
  readonly mood?: 'calm' | 'chaos' | 'learn';
  readonly className?: string;
}

const moodTone = {
  calm: 'neutral' as const,
  chaos: 'brand' as const,
  learn: 'accent' as const,
};

export function CommunityCard({
  name,
  description,
  memberCount,
  href,
  mood = 'calm',
  className,
}: CommunityCardProps) {
  return (
    <article className={clsx('rounded-xl border border-subtle/15 bg-surface p-5', className)}>
      <Link href={href} className={clsx('block space-y-3', focusRing)}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-fg">{name}</h3>
          <Badge tone={moodTone[mood]}>{mood}</Badge>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{description}</p>
        <p className="text-xs text-subtle">{memberCount} members</p>
      </Link>
    </article>
  );
}
