const preset = require('@next/config/tailwind/base');

module.exports = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/web/**/*.{ts,tsx}'],
};
