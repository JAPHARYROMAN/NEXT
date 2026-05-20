'use client';

import clsx from 'clsx';

export interface PinnedMessageProps {
  readonly author: string;
  readonly body: string;
  readonly className?: string;
}

export function PinnedMessage({ author, body, className }: PinnedMessageProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-sm',
        className,
      )}
      role="note"
      aria-label="Pinned message"
    >
      <p className="text-xs font-medium text-accent">Pinned · {author}</p>
      <p className="mt-1">{body}</p>
    </div>
  );
}
