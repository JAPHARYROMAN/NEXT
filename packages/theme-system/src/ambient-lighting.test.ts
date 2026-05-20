import { describe, expect, it } from 'vitest';
import { applyAmbientLighting } from './ambient-lighting';

describe('ambient-lighting', () => {
  it('sets data attribute and CSS variable', () => {
    const el = document.createElement('div');
    applyAmbientLighting(el, 'aurora');
    expect(el.dataset['ambient']).toBe('aurora');
    expect(el.style.getPropertyValue('--next-ambient-gradient')).toContain('linear-gradient');
  });
});
