'use client';

import Link from 'next/link';
import { useAuthStore } from '@next/frontend-utils';

export function AppTopBar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex items-center justify-between border-b border-subtle/15 px-4 py-4 md:px-8">
      <form role="search" className="hidden max-w-md flex-1 md:block">
        <label htmlFor="search" className="sr-only">
          Search NEXT
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search creators, worlds, moments…"
          className="w-full rounded-lg border border-subtle/20 bg-elevated px-4 py-2 text-sm text-fg placeholder:text-subtle"
        />
      </form>
      <div className="ml-auto flex items-center gap-3">
        <Link
          href={user ? `/creator/${user.handle}` : '/auth'}
          className="text-sm text-muted hover:text-fg"
        >
          {user?.displayName ?? 'Sign in'}
        </Link>
        <Link
          href="http://localhost:3020"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-elevated hover:text-fg"
        >
          Studio
        </Link>
      </div>
    </header>
  );
}
