'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import type { ProfileVisibility } from './store/profile-store';

export interface ProfilePreviewProps {
  readonly displayName: string;
  readonly handle: string;
  readonly bio: string;
  readonly visibility: ProfileVisibility;
  readonly className?: string;
}

export function ProfilePreview({
  displayName,
  handle,
  bio,
  visibility,
  className,
}: ProfilePreviewProps) {
  const name = displayName.trim() || 'Your name';
  const h = handle.trim() || 'handle';

  return (
    <Surface bordered className={clsx('p-5', className)} aria-label="Profile preview">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 text-lg font-medium">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-fg">{name}</p>
          <p className="text-sm text-muted">@{h}</p>
        </div>
      </div>
      {bio ? <p className="mt-3 text-sm text-muted">{bio}</p> : null}
      <p className="mt-3 text-xs capitalize text-muted">Visibility: {visibility}</p>
    </Surface>
  );
}
