'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { Surface } from '@next/ui';
import { CREATOR_SUGGESTIONS, useFirstRunStore, VIEWER_SUGGESTIONS } from './store/first-run-store';
import { trackFirstFeedEntry } from './telemetry';

export interface FirstRunActivationProps {
  readonly className?: string;
}

export function FirstRunActivation({ className }: FirstRunActivationProps) {
  const path = useFirstRunStore((s) => s.path);
  const checklist = useFirstRunStore((s) => s.checklistComplete);
  const completeItem = useFirstRunStore((s) => s.completeChecklistItem);
  const markFeed = useFirstRunStore((s) => s.markFeedViewed);

  const suggestions = path === 'creator' ? CREATOR_SUGGESTIONS : VIEWER_SUGGESTIONS;

  return (
    <section
      className={clsx('mx-auto max-w-2xl space-y-6', className)}
      aria-labelledby="first-run-heading"
    >
      <header>
        <h2 id="first-run-heading" className="text-xl font-semibold text-fg">
          First steps
        </h2>
        <p className="mt-2 text-sm text-muted">
          Gentle activation — no streaks, no pressure. Check items off as you explore.
        </p>
      </header>
      <ul className="space-y-3">
        {suggestions.map((item) => {
          const done = checklist.includes(item.id);
          return (
            <li key={item.id}>
              <Surface bordered className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-fg">{item.label}</p>
                  <p className="text-xs capitalize text-muted">{item.kind}</p>
                </div>
                <div className="flex items-center gap-2">
                  {done ? (
                    <span className="text-xs text-accent" role="status">
                      Done
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    onClick={() => {
                      completeItem(item.id);
                      if (item.id === 'feed') {
                        markFeed();
                        trackFirstFeedEntry('first_run');
                      }
                    }}
                    className="rounded-lg border border-subtle/20 px-3 py-1.5 text-sm hover:bg-elevated/40"
                  >
                    Open
                  </Link>
                </div>
              </Surface>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
