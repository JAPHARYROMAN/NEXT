'use client';

import { Surface } from '@next/ui';
import type { LedgerEntry } from './types';

export interface RevenueLedgerPreviewProps {
  readonly entries: readonly LedgerEntry[];
  readonly onDownloadStatement?: () => void;
}

export function RevenueLedgerPreview({ entries, onDownloadStatement }: RevenueLedgerPreviewProps) {
  return (
    <Surface bordered className="p-5" aria-label="Revenue ledger">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-fg">Ledger preview</h3>
        {onDownloadStatement ? (
          <button
            type="button"
            onClick={onDownloadStatement}
            className="text-xs text-accent hover:underline"
          >
            Download statement
          </button>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2" role="list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle/10 pb-2 text-sm last:border-0"
          >
            <div>
              <p className="text-fg">{entry.description}</p>
              <p className="text-xs text-muted">
                {entry.date} · {entry.source}
              </p>
            </div>
            <span className="font-medium text-fg">{entry.amount}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
