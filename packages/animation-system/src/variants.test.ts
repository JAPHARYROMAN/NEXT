import { describe, expect, it } from 'vitest';
import { motionSafe, fadeVariants } from './variants';

describe('motionSafe', () => {
  it('returns empty variants when reduced motion', () => {
    const v = motionSafe(fadeVariants, true);
    expect(v).toEqual({ initial: {}, animate: {}, exit: {} });
  });
  it('returns originals when motion allowed', () => {
    const v = motionSafe(fadeVariants, false);
    expect(v).toBe(fadeVariants);
  });
});
