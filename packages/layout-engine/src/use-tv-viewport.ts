'use client';

import { useEffect, useState } from 'react';
import { breakpoints } from './breakpoints';

export type TvViewportClass = 'standard' | 'tv' | 'ultrawide' | 'projector';

export function useTvViewport(): TvViewportClass {
  const [vp, setVp] = useState<TvViewportClass>('standard');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= breakpoints.projector) setVp('projector');
      else if (w >= breakpoints.ultrawide) setVp('ultrawide');
      else if (w >= breakpoints.tv) setVp('tv');
      else setVp('standard');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return vp;
}
