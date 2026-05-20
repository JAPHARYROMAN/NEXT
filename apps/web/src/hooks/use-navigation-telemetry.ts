'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackNavigation } from '@next/frontend-utils';

export function useNavigationTelemetry(): void {
  const pathname = usePathname();
  const started = useRef(Date.now());
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current !== null) {
      const duration = Date.now() - started.current;
      trackNavigation(previous.current, pathname, duration);
    }
    previous.current = pathname;
    started.current = Date.now();
  }, [pathname]);
}
