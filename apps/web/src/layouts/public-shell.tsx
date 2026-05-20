import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button, SkipLink } from '@next/ui';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SkipLink />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          NEXT
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/discovery" className="text-muted hover:text-fg">
            Discover
          </Link>
          <Link href="/auth">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
