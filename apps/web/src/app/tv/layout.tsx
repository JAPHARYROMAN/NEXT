import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NEXT Theater TV',
  description: 'Cinematic large-screen experience — lean-back, calm, socially alive.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050508',
};

export default function TvLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tv-root min-h-screen bg-bg text-fg [--tv-max-width:1680px]">{children}</div>
  );
}
