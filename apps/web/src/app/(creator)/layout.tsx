import type { ReactNode } from 'react';
import { PageTransition } from '@next/animation-system';

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PageTransition routeKey="creator">{children}</PageTransition>
    </div>
  );
}
