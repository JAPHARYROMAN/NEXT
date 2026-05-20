import { mergeConfig } from 'vitest/config';
import base from './base.ts';

export default mergeConfig(base, {
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
