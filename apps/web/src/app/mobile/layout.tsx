import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NEXT Mobile',
  description: 'Touch-native adaptive mobile experience',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-root min-h-dvh bg-bg lg:max-w-lg lg:mx-auto lg:border-x lg:border-subtle/10">
      {children}
    </div>
  );
}
