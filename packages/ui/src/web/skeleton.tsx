import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  readonly rounded?: 'sm' | 'md' | 'lg';
}

const roundedClass = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg' };

export function Skeleton({ className, rounded = 'md', ...rest }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse bg-elevated/80', roundedClass[rounded], className)}
      aria-hidden
      {...rest}
    />
  );
}
