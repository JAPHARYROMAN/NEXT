import { breakpoints } from '@next/design-system';

export type DeviceClass = 'phone' | 'tablet' | 'desktop' | 'foldable' | 'ultrawide';

export type Orientation = 'portrait' | 'landscape';

export function resolveDeviceClass(width: number, height?: number): DeviceClass {
  const ratio = height && height > 0 ? width / height : 1;
  if (width >= breakpoints.ultrawide) return 'ultrawide';
  if (width >= breakpoints.lg) return 'desktop';
  if (width >= breakpoints.md) {
    if (ratio > 1.4 && ratio < 2.2) return 'foldable';
    return 'tablet';
  }
  return 'phone';
}

export function resolveOrientation(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait';
}

export function resolveDensity(device: DeviceClass): 'compact' | 'comfortable' | 'immersive' {
  if (device === 'phone') return 'immersive';
  if (device === 'tablet' || device === 'foldable') return 'comfortable';
  return 'compact';
}
