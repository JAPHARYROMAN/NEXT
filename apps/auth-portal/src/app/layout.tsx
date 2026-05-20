import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@next/design-system/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Sign in · NEXT', template: '%s · NEXT' },
  description: 'Sign in to NEXT.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#08080b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="bg-bg text-fg font-sans antialiased">
        <div className="min-h-screen grid place-items-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </body>
    </html>
  );
}
