import react from './react.mjs';

export default [
  ...react,
  {
    files: ['**/app/**/*.{ts,tsx}', '**/pages/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
    },
  },
];
