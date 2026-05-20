'use client';

import clsx from 'clsx';
import { Button } from '@next/ui';

export interface FollowShellProps {
  readonly handle: string;
  readonly following?: boolean;
  readonly onToggle?: (handle: string) => void;
  readonly className?: string;
}

export function FollowShell({ handle, following, onToggle, className }: FollowShellProps) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <Button
        variant={following ? 'secondary' : 'primary'}
        size="sm"
        onClick={() => onToggle?.(handle)}
        aria-pressed={following}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      <span className="text-sm text-muted">@{handle}</span>
    </div>
  );
}
