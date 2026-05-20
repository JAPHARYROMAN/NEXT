import { describe, expect, it } from 'vitest';
import { resolveTheme } from './apply-theme';

describe('resolveTheme', () => {
  it('follows system dark', () => {
    expect(resolveTheme('system', true)).toBe('dark');
  });
  it('follows system light', () => {
    expect(resolveTheme('system', false)).toBe('light');
  });
  it('honors explicit preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
  });
});
