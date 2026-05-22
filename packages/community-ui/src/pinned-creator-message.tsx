'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface PinnedCreatorMessageProps {
  readonly creatorName: string;
  readonly message: string;
  readonly postedAt: string;
  readonly className?: string;
}

export function PinnedCreatorMessage({
  creatorName,
  message,
  postedAt,
  className,
}: PinnedCreatorMessageProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Pinned creator message">
      <p className="text-xs font-medium text-accent">Pinned · {creatorName}</p>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
      <p className="mt-2 text-xs text-subtle">{postedAt}</p>
    </Surface>
  );
}
