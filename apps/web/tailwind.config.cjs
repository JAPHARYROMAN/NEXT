const preset = require('@next/config/tailwind/base');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
  ],
};
