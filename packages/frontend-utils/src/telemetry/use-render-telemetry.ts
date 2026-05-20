'use client';

import { useEffect, useRef } from 'react';
import { trackRender } from './index';

/** Measure mount/update render duration for a surface or component. */
export function useRenderTelemetry(component: string): void {
  const started = useRef(performance.now());

  useEffect(() => {
    const duration = performance.now() - started.current;
    trackRender(component, Math.round(duration));
    started.current = performance.now();
  });
}
