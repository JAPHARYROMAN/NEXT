'use client';

import type { ReactNode } from 'react';
import { TheaterShell } from './theater-shell';

export interface FullscreenShellProps {
  readonly title: string;
  readonly children?: ReactNode;
}

/** Cinematic fullscreen presentation shell (UI only). */
export function FullscreenShell(props: FullscreenShellProps) {
  return <TheaterShell {...props} mode="fullscreen" />;
}
