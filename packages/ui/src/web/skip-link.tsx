import { focusRing } from '@next/design-system';
import clsx from 'clsx';

export interface SkipLinkProps {
  readonly href?: string;
  readonly label?: string;
}

export function SkipLink({
  href = '#main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={clsx(
        'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]',
        'rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white',
        focusRing,
      )}
    >
      {label}
    </a>
  );
}
