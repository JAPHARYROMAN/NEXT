import { describe, expect, it } from 'vitest';
import { depthLayers, spatialScale, ambientLight } from './spatial-tokens';

describe('spatial-tokens', () => {
  it('orders depth layers for stacking', () => {
    expect(depthLayers.focus).toBeGreaterThan(depthLayers.content);
    expect(depthLayers.ambient).toBeGreaterThan(depthLayers.base);
  });

  it('defines spatial scale tiers', () => {
    expect(spatialScale.near).toBe(1);
    expect(spatialScale.far).toBeLessThan(spatialScale.near);
  });

  it('includes ambient light variants', () => {
    expect(ambientLight.cinematic).toBeDefined();
  });
});
