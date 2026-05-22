import { describe, expect, it } from 'vitest';
import { planChunks } from './index';

describe('upload-sdk', () => {
  it('plans at least one chunk', () => {
    expect(planChunks(1024).length).toBeGreaterThan(0);
  });
});
