'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PageTransition } from '@/animations/page-motion';

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <PageTransition routeKey={pathname}>{children}</PageTransition>;
}
