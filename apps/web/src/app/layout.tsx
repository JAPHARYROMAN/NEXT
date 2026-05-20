import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@next/design-system/tokens.css';
import './globals.css';
import '@/styles/cinematic.css';
import { AppProviders } from '@/providers/app-providers';
import { AuthHydrator } from '@/providers/auth-hydrator';
import { TelemetryInit } from '@/providers/telemetry-init';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://next.example'),
  title: { default: 'NEXT', template: '%s · NEXT' },
  description: 'A planetary-scale, human-centered, AI-native media ecosystem.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080b' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="next-ambient bg-bg text-fg font-sans antialiased">
        <AppProviders>
          <TelemetryInit />
          <AuthHydrator>{children}</AuthHydrator>
        </AppProviders>
      </body>
    </html>
  );
}
