'use client';

import clsx from 'clsx';
import { ReactionBar } from './reaction-bar';
import { ModerationNotice } from './moderation-notice';

export interface ThreadComment {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly time: string;
  readonly depth?: number;
  readonly quoteOf?: string;
  readonly hasMedia?: boolean;
}

export interface DiscussionThreadProps {
  readonly title?: string;
  readonly comments: readonly ThreadComment[];
  readonly showModeration?: boolean;
  readonly className?: string;
}

export function DiscussionThread({
  title = 'Discussion',
  comments,
  showModeration = false,
  className,
}: DiscussionThreadProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <ReactionBar />
      </div>
      {showModeration ? (
        <ModerationNotice message="Discussions are chronologically warm — not rage-ranked." />
      ) : null}
      <ol className="space-y-3" aria-label="Comments">
        {comments.map((c) => (
          <li
            key={c.id}
            className={clsx(
              'rounded-xl border border-subtle/10 bg-surface/40 p-3',
              (c.depth ?? 0) > 0 && 'ml-4 md:ml-8',
            )}
            style={{ marginLeft: `${(c.depth ?? 0) * 0.5}rem` }}
          >
            {c.quoteOf ? (
              <blockquote className="mb-2 border-l-2 border-accent/30 pl-3 text-xs text-muted">
                {c.quoteOf}
              </blockquote>
            ) : null}
            <p className="text-xs font-medium text-muted">{c.author}</p>
            <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
            {c.hasMedia ? (
              <p className="mt-2 text-xs text-accent">Media attachment — preview pending API</p>
            ) : null}
            <p className="mt-2 text-xs text-subtle">{c.time}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
