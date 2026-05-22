'use client';

import clsx from 'clsx';

export interface RecentSavedSearchesProps {
  readonly recent: readonly string[];
  readonly saved: readonly string[];
  readonly onSelect: (query: string) => void;
  readonly onSave?: (query: string) => void;
  readonly className?: string;
}

export function RecentSavedSearches({
  recent,
  saved,
  onSelect,
  className,
}: RecentSavedSearchesProps) {
  if (recent.length === 0 && saved.length === 0) return null;

  return (
    <div className={clsx('space-y-4', className)}>
      {recent.length > 0 ? (
        <section aria-label="Recent searches">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Recent</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recent.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  className="rounded-full bg-surface/60 px-3 py-1 text-sm text-muted hover:text-fg"
                  onClick={() => onSelect(q)}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {saved.length > 0 ? (
        <section aria-label="Saved searches">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Saved</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {saved.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  className="rounded-full border border-accent/30 px-3 py-1 text-sm text-accent hover:bg-accent/10"
                  onClick={() => onSelect(q)}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
