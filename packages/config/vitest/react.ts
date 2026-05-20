import { mergeConfig } from 'vitest/config';
import base from './base';

export default mergeConfig(base, {
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
