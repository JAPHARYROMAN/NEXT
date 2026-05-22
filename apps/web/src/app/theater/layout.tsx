import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NEXT Theater',
  description: 'Immersive theater mode for large screens and projectors.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050508',
};

export default function TheaterLayout({ children }: { children: ReactNode }) {
  return <div className="theater-root min-h-screen bg-black text-fg">{children}</div>;
}
