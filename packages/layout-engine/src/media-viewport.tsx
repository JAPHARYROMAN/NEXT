'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useBreakpoint } from './use-breakpoint';

export interface MediaViewportProps {
  readonly children: ReactNode;
  readonly className?: string;
}

import type { Breakpoint } from '@next/design-system';

const maxWidth: Partial<Record<Breakpoint, string>> = {
  sm: 'max-w-full',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-6xl',
  ultrawide: 'max-w-[90rem]',
};

export function MediaViewport({ children, className }: MediaViewportProps) {
  const bp = useBreakpoint();
  const width = maxWidth[bp] ?? 'max-w-5xl';

  return <div className={clsx('mx-auto w-full px-0', width, className)}>{children}</div>;
}
