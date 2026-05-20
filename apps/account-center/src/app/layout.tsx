import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import '@next/design-system/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Account · NEXT', template: '%s · NEXT' },
  description: 'Manage your NEXT identity.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#08080b',
  width: 'device-width',
  initialScale: 1,
};

const nav = [
  { href: '/profile', label: 'Profile' },
  { href: '/sessions', label: 'Sessions' },
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="bg-bg text-fg font-sans antialiased">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header className="flex items-center justify-between border-b border-subtle/20 pb-4">
            <span className="font-display text-h3">Account</span>
            <nav className="flex gap-4 text-small">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted hover:text-fg transition">
                  {n.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="pt-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
