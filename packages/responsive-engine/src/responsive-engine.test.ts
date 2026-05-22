import { describe, expect, it } from 'vitest';
import { resolveDeviceClass, resolveDensity, resolveOrientation } from './device-class';

describe('responsive-engine', () => {
  it('classifies phone viewport', () => {
    expect(resolveDeviceClass(390, 844)).toBe('phone');
    expect(resolveDensity('phone')).toBe('immersive');
  });

  it('classifies tablet and desktop', () => {
    expect(resolveDeviceClass(820, 1180)).toBe('tablet');
    expect(resolveDeviceClass(1440, 900)).toBe('desktop');
  });

  it('resolves orientation', () => {
    expect(resolveOrientation(390, 844)).toBe('portrait');
    expect(resolveOrientation(844, 390)).toBe('landscape');
  });
});
