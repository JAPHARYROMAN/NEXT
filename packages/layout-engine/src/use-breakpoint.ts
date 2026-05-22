'use client';

import { useEffect, useState } from 'react';
import { breakpoints, type Breakpoint } from '@next/design-system';

const ORDER: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl', 'ultrawide'];

function currentBreakpoint(width: number): Breakpoint {
  let active: Breakpoint = 'sm';
  for (const bp of ORDER) {
    if (width >= breakpoints[bp]) active = bp;
  }
  return active;
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('lg');

  useEffect(() => {
    const update = () => setBp(currentBreakpoint(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}
