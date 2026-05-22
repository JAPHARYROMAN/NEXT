'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { focusRing } from '@next/design-system';
import { Avatar } from './avatar';
import { Badge } from './badge';

export interface CreatorCardProps {
  readonly handle: string;
  readonly displayName: string;
  readonly bio?: string;
  readonly followerLabel?: string;
  readonly href: string;
  readonly avatarUrl?: string;
  readonly live?: boolean;
  readonly className?: string;
}

export function CreatorCard({
  handle,
  displayName,
  bio,
  followerLabel,
  href,
  avatarUrl,
  live,
  className,
}: CreatorCardProps) {
  return (
    <article className={clsx('rounded-xl bg-surface p-4 shadow-elevation1', className)}>
      <Link href={href} className={clsx('flex gap-4', focusRing)}>
        <Avatar name={displayName} size="lg" {...(avatarUrl ? { src: avatarUrl } : {})} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-fg">{displayName}</h3>
            {live ? <Badge tone="danger">Live</Badge> : null}
          </div>
          <p className="text-sm text-muted">@{handle}</p>
          {bio ? <p className="mt-2 line-clamp-2 text-sm text-subtle">{bio}</p> : null}
          {followerLabel ? <p className="mt-2 text-xs text-muted">{followerLabel}</p> : null}
        </div>
      </Link>
    </article>
  );
}
