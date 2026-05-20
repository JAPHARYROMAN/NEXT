'use client';

import clsx from 'clsx';

export interface TrustedContributorBadgeProps {
  readonly label?: string;
  readonly className?: string;
}

export function TrustedContributorBadge({
  label = 'Trusted contributor',
  className,
}: TrustedContributorBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent',
        className,
      )}
    >
      <span aria-hidden>◈</span>
      {label}
    </span>
  );
}
