import type { ReactNode } from 'react';
import { PublicShell } from '@/layouts/public-shell';
import { RouteTransition } from '@/transitions/route-transition';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicShell>
      <RouteTransition>{children}</RouteTransition>
    </PublicShell>
  );
}
