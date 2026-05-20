import { describe, expect, it } from 'vitest';
import { selectRung, DEFAULT_LADDER } from './index';

describe('streaming-utils', () => {
  it('selects a rung within throughput budget', () => {
    const rung = selectRung(DEFAULT_LADDER, 5000);
    expect(rung.bitrateKbps).toBeLessThanOrEqual(5000);
  });
});
