'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { IconStudio } from '@next/icons';
import { CreatorWorkspace } from '@next/layout-engine';
import { PageTransition } from '@next/animation-system';
import { useScrollMotion } from '@next/animation-system';
import { trackNavigation } from '@next/frontend-utils';
import { useEffect, useRef } from 'react';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/content', label: 'Content' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/revenue', label: 'Revenue' },
  { href: '/monetization', label: 'Monetization' },
  { href: '/sponsorships', label: 'Sponsorships' },
  { href: '/payouts', label: 'Payouts' },
  { href: '/live', label: 'Live control' },
  { href: '/community', label: 'Community' },
] as const;

function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4" aria-label="Studio">
      <div className="mb-6 flex items-center gap-2 font-semibold">
        <IconStudio size={22} />
        Studio
      </div>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={clsx(
            'rounded-lg px-3 py-2 text-sm transition-colors',
            pathname === l.href ? 'bg-elevated text-fg' : 'text-muted hover:bg-elevated/50',
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const { progress } = useScrollMotion(200);

  useEffect(() => {
    if (prev.current !== pathname) {
      trackNavigation(prev.current, pathname, 0);
      prev.current = pathname;
    }
  }, [pathname]);

  return (
    <CreatorWorkspace
      nav={<StudioNav />}
      main={
        <div className="p-6 md:p-8" style={{ opacity: 1 - progress * 0.05 }}>
          <PageTransition routeKey={pathname}>{children}</PageTransition>
        </div>
      }
    />
  );
}
