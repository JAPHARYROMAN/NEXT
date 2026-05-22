'use client';

import { Surface } from '@next/ui';

export interface SponsorshipDisclosureBannerProps {
  readonly brand: string;
  readonly required?: boolean;
}

export function SponsorshipDisclosureBanner({
  brand,
  required = true,
}: SponsorshipDisclosureBannerProps) {
  return (
    <Surface
      bordered
      className="border-amber-500/20 bg-amber-500/5 p-4"
      role="note"
      aria-label="Sponsorship disclosure reminder"
    >
      <p className="text-sm text-fg">
        {required ? 'Required disclosure:' : 'Disclosure reminder:'} This content is sponsored by{' '}
        {brand}. Label clearly before publish.
      </p>
    </Surface>
  );
}
