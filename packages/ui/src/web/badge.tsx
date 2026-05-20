import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'danger' | 'success';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-elevated text-muted',
  brand: 'bg-brand/15 text-brand',
  accent: 'bg-accent/15 text-accent',
  danger: 'bg-danger/15 text-danger',
  success: 'bg-success/15 text-success',
};

export function Badge({ children, tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
