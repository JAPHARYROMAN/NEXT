import { describe, expect, it } from 'vitest';
import { colorCss } from './colors';

describe('colorCss', () => {
  it('formats rgb with alpha', () => {
    expect(colorCss('dark', 'bg', 0.5)).toBe('rgb(8, 8, 11 / 0.5)');
  });
});
