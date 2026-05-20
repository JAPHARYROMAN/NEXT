'use client';

import clsx from 'clsx';

export interface ModerationBannerProps {
  readonly message: string;
  readonly actionLabel?: string;
  readonly className?: string;
}

export function ModerationBanner({
  message,
  actionLabel = 'Learn more',
  className,
}: ModerationBannerProps) {
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm',
        className,
      )}
      role="alert"
    >
      <p>{message}</p>
      <button type="button" className="text-xs font-medium text-warning underline">
        {actionLabel}
      </button>
    </div>
  );
}
