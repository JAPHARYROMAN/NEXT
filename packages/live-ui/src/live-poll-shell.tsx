'use client';

import clsx from 'clsx';

export interface PollOption {
  readonly id: string;
  readonly label: string;
  readonly votes: number;
}

export interface LivePollShellProps {
  readonly question: string;
  readonly options: readonly PollOption[];
  readonly className?: string;
}

export function LivePollShell({ question, options, className }: LivePollShellProps) {
  const total = options.reduce((s, o) => s + o.votes, 0) || 1;

  return (
    <section
      className={clsx('space-y-3 rounded-xl border border-subtle/15 p-4', className)}
      aria-label="Live poll"
    >
      <h3 className="text-sm font-medium">{question}</h3>
      <ul className="space-y-2">
        {options.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              className="w-full rounded-lg bg-surface/50 px-3 py-2 text-left text-sm hover:bg-surface/80"
            >
              {o.label}
              <span className="ml-2 text-xs text-muted">
                {Math.round((o.votes / total) * 100)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-subtle">Poll API — placeholder</p>
    </section>
  );
}
