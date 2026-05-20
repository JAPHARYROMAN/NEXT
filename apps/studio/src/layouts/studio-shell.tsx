'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { IconStudio } from '@next/icons';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/content', label: 'Content' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/monetization', label: 'Monetization' },
  { href: '/live', label: 'Live control' },
] as const;

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 shrink-0 border-r border-subtle/15 bg-surface p-4">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          <IconStudio size={22} />
          Studio
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm',
                pathname === l.href ? 'bg-elevated text-fg' : 'text-muted hover:bg-elevated/50',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
