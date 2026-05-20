'use client';

import type { ReactNode } from 'react';
import { AdaptiveLayout } from '@next/layout-engine';
import { AppNav, MobileNav, PlayerShell, SkipLink } from '@next/ui';
import { usePlayerStore, useRenderTelemetry } from '@next/frontend-utils';
import { primaryNavItems } from '@/lib/nav-items';
import { AppTopBar } from '@/components/app-top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  useRenderTelemetry('AppShell');

  const mode = usePlayerStore((s) => s.mode);
  const title = usePlayerStore((s) => s.title);
  const mediaId = usePlayerStore((s) => s.mediaId);

  return (
    <>
      <SkipLink />
      <AdaptiveLayout
        sidebar={<AppNav items={primaryNavItems} />}
        player={mediaId ? <PlayerShell mode={mode} title={title} /> : null}
        main={
          <div className="flex min-h-full flex-col pb-20 lg:pb-0">
            <AppTopBar />
            <div id="main-content" className="flex-1 px-4 py-6 md:px-8">
              {children}
            </div>
          </div>
        }
      />
      <MobileNav items={primaryNavItems} />
    </>
  );
}
