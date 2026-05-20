'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TheaterShell } from '@next/theater-ui';
import { RemoteShortcuts } from '@next/remote-navigation';
import { useRenderTelemetry } from '@next/frontend-utils';

export interface TvExperienceShellProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly onBack?: () => void;
  readonly className?: string;
}

export function TvExperienceShell({ children, title, onBack, className }: TvExperienceShellProps) {
  useRenderTelemetry('TvExperienceShell');

  return (
    <TheaterShell {...(onBack ? { onBack } : {})} {...(className ? { className } : {})}>
      {title ? (
        <header className="px-10 pt-8 tv:px-14">
          <h1 className="font-display text-2xl text-muted tv:text-3xl">{title}</h1>
        </header>
      ) : null}
      <RemoteShortcuts {...(onBack ? { onBack } : {})} />
      <div className={clsx('min-h-screen', title ? 'pt-4' : '')}>{children}</div>
    </TheaterShell>
  );
}
