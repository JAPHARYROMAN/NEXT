import { describe, expect, it } from 'vitest';
import { minWidth } from './breakpoints';

describe('minWidth', () => {
  it('builds media query', () => {
    expect(minWidth('lg')).toBe('(min-width: 1024px)');
  });
});
