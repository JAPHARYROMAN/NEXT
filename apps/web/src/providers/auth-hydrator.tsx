'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@next/frontend-utils';

export function AuthHydrator({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
