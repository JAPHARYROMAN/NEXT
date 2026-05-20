const preset = require('@next/config/tailwind/base');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/spatial-ui/src/**/*.{ts,tsx}',
    '../../packages/immersive-ui/src/**/*.{ts,tsx}',
    '../../packages/environment-ui/src/**/*.{ts,tsx}',
    '../../packages/ambient-motion/src/**/*.{ts,tsx}',
  ],
};
