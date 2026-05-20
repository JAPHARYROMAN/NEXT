'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface PostLiveTransitionProps {
  readonly replayHref: string;
  readonly discussionHref?: string;
  readonly className?: string;
}

export function PostLiveTransition({
  replayHref,
  discussionHref,
  className,
}: PostLiveTransitionProps) {
  return (
    <Surface
      bordered
      className={clsx('space-y-3 p-5', className)}
      role="status"
      aria-label="Post-live transition"
    >
      <p className="font-medium">This live has ended</p>
      <p className="text-sm text-muted">Replay and community discussion are ready when you are.</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={replayHref}
          className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
        >
          Watch replay
        </a>
        {discussionHref ? (
          <a
            href={discussionHref}
            className="inline-flex rounded-lg border border-subtle/20 px-4 py-2 text-sm"
          >
            Join discussion
          </a>
        ) : null}
      </div>
    </Surface>
  );
}
