'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import { AmbientReactions } from './ambient-reactions';

export interface DiscussionShellProps {
  readonly title?: string;
  readonly placeholderCount?: number;
  readonly className?: string;
}

export function DiscussionShell({
  title = 'Discussion',
  placeholderCount = 3,
  className,
}: DiscussionShellProps) {
  const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);

  return (
    <Surface bordered className={clsx('flex flex-col gap-4 p-4', className)} aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <AmbientReactions />
      </div>
      <ul className="space-y-3" aria-label="Comments">
        {placeholders.map((i) => (
          <li key={i} className="rounded-lg bg-surface/40 px-3 py-2 text-sm text-muted">
            Thoughtful thread placeholder {i + 1} — connect discussion API when ready.
          </li>
        ))}
      </ul>
      <label className="sr-only" htmlFor="discussion-input">
        Add a comment
      </label>
      <textarea
        id="discussion-input"
        rows={2}
        placeholder="Share a calm, constructive thought…"
        className="w-full resize-none rounded-xl border border-subtle/20 bg-transparent px-3 py-2 text-sm"
      />
    </Surface>
  );
}
