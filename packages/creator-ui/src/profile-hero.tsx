'use client';

import { Avatar, Badge } from '@next/ui';
import { CinematicHeader } from './cinematic-header';

export interface ProfileHeroProps {
  readonly handle: string;
  readonly displayName: string;
  readonly bio?: string;
  readonly followerLabel?: string;
  readonly live?: boolean;
  readonly featuredCount?: number;
}

export function ProfileHero({
  handle,
  displayName,
  bio,
  followerLabel,
  live,
  featuredCount = 0,
}: ProfileHeroProps) {
  return (
    <div className="space-y-6">
      <CinematicHeader
        title={displayName}
        subtitle={bio ?? `@${handle} on NEXT`}
        gradient="depth"
        actions={
          live ? (
            <Badge tone="danger" className="animate-pulse">
              Live now
            </Badge>
          ) : null
        }
      />
      <div className="flex items-center gap-4">
        <Avatar name={displayName} size="lg" />
        <div>
          <p className="text-sm text-muted">@{handle}</p>
          {followerLabel ? <p className="text-sm">{followerLabel}</p> : null}
          {featuredCount > 0 ? (
            <p className="mt-1 text-xs text-muted">{featuredCount} featured works</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
