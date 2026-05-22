import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@next/design-system/tokens.css';
import './globals.css';
import { ThemeProvider } from '@next/ui';
import { AdminShell } from '@/layouts/admin-shell';

export const metadata: Metadata = {
  title: { default: 'NEXT Admin', template: '%s · Admin' },
  description: 'Operations console for NEXT.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg text-fg antialiased">
        <ThemeProvider initial="dark">
          <AdminShell>{children}</AdminShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
