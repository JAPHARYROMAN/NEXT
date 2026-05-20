'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/layouts/app-shell';
import { AuthGate } from '@/features/auth/auth-gate';
import { RouteTransition } from '@/transitions/route-transition';
import { useNavigationTelemetry } from '@/hooks/use-navigation-telemetry';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  useNavigationTelemetry();

  return (
    <AuthGate>
      <AppShell>
        <RouteTransition>{children}</RouteTransition>
      </AppShell>
    </AuthGate>
  );
}
