import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__generated__/**',
        '**/generated/**',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
      ],
    },
    reporters: process.env['CI'] ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './coverage/junit.xml' },
  },
});
