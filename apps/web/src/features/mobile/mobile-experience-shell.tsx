'use client';

import type { ReactNode } from 'react';
import { MobileShell } from '@next/adaptive-layouts';
import { AdaptiveBottomNav, ContextualNavBar } from '@next/navigation-ui';
import { OfflineBanner } from '@next/offline-ui';
import { useRenderTelemetry } from '@next/frontend-utils';
import { mobileNavItems } from '@/lib/mobile-nav-items';

export interface MobileExperienceShellProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly immersive?: boolean;
  readonly actions?: ReactNode;
}

export function MobileExperienceShell({
  title,
  children,
  immersive,
  actions,
}: MobileExperienceShellProps) {
  useRenderTelemetry('MobileExperienceShell');

  return (
    <MobileShell
      {...(immersive ? { immersive: true } : {})}
      header={
        !immersive ? (
          <>
            <OfflineBanner />
            <ContextualNavBar title={title} actions={actions} />
          </>
        ) : null
      }
      nav={!immersive ? <AdaptiveBottomNav items={mobileNavItems} /> : null}
    >
      {children}
    </MobileShell>
  );
}
