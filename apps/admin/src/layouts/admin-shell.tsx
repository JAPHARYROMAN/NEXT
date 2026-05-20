'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/moderation', label: 'Moderation' },
  { href: '/trust', label: 'Trust & safety' },
  { href: '/analytics', label: 'Analytics ops' },
  { href: '/health', label: 'System health' },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 shrink-0 border-r border-subtle/15 bg-surface p-4">
        <div className="mb-8 text-sm font-semibold uppercase tracking-wider text-muted">
          Operations
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
