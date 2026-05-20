const preset = require('@next/config/tailwind/base');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
    '../../packages/layout-engine/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        display: ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        body: ['1rem', { lineHeight: '1.55' }],
      },
    },
  },
};
