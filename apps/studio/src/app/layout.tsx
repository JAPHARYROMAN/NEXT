import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@next/design-system/tokens.css';
import '@next/creator-ui/globals.css';
import './globals.css';
import { ThemeProvider } from '@next/ui';
import { StudioShell } from '@/layouts/studio-shell';
import { StudioProviders } from '@/providers/studio-providers';

export const metadata: Metadata = {
  title: { default: 'NEXT Studio', template: '%s · Studio' },
  description: 'Creator workstation for NEXT.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg text-fg antialiased">
        <ThemeProvider initial="dark">
          <StudioProviders>
            <StudioShell>{children}</StudioShell>
          </StudioProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
