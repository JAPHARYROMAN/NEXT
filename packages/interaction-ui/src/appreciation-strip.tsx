'use client';

import clsx from 'clsx';

export interface AppreciationStripProps {
  readonly creator: string;
  readonly message?: string;
  readonly className?: string;
}

export function AppreciationStrip({
  creator,
  message = 'Support without noise — tipping connects when commerce API is live.',
  className,
}: AppreciationStripProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-subtle/15 bg-gradient-to-r from-accent/5 to-transparent px-4 py-3',
        className,
      )}
      role="note"
      aria-label={`Appreciation for ${creator}`}
    >
      <p className="text-sm font-medium">{creator}</p>
      <p className="mt-1 text-xs text-muted">{message}</p>
    </div>
  );
}
