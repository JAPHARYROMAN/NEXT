'use client';

import { useEffect, useState } from 'react';
import {
  resolveDeviceClass,
  resolveOrientation,
  type DeviceClass,
  type Orientation,
} from './device-class';

export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly device: DeviceClass;
  readonly orientation: Orientation;
}

function readViewport(): ViewportState {
  if (typeof window === 'undefined') {
    return { width: 390, height: 844, device: 'phone', orientation: 'portrait' };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    device: resolveDeviceClass(width, height),
    orientation: resolveOrientation(width, height),
  };
}

export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(readViewport);

  useEffect(() => {
    const update = () => setState(readViewport());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return state;
}
