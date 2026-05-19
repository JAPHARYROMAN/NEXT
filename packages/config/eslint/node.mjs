import base from './base.mjs';

export default [
  ...base,
  {
    files: ['**/*.{ts,js,mjs,cjs}'],
    languageOptions: {
      globals: { process: 'readonly', Buffer: 'readonly', __dirname: 'readonly' },
    },
    rules: {
      'no-process-env': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
