'use client';

import clsx from 'clsx';

export interface CreatorVerificationProps {
  readonly verified: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function CreatorVerification({
  verified,
  label = 'Verified',
  className,
}: CreatorVerificationProps) {
  if (!verified) return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-xs text-brand',
        className,
      )}
      role="status"
    >
      <span aria-hidden>✓</span>
      {label}
    </span>
  );
}
