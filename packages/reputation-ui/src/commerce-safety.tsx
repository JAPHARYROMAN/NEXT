'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface CommerceSafetyWarningProps {
  readonly reason: string;
  readonly severity?: 'info' | 'caution';
}

export function CommerceSafetyWarning({
  reason,
  severity = 'caution',
}: CommerceSafetyWarningProps) {
  return (
    <Surface
      bordered
      className={clsx(
        'p-4',
        severity === 'caution'
          ? 'border-amber-500/25 bg-amber-500/5'
          : 'border-sky-500/25 bg-sky-500/5',
      )}
      role="alert"
      aria-label="Commerce safety warning"
    >
      <p className="text-sm text-fg">{reason}</p>
    </Surface>
  );
}

export interface SponsorshipDisclosureBadgeProps {
  readonly brand: string;
}

export function SponsorshipDisclosureBadge({ brand }: SponsorshipDisclosureBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-100"
      aria-label={`Sponsored by ${brand}`}
    >
      Sponsored · {brand}
    </span>
  );
}
