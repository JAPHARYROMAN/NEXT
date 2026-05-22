const preset = require('@next/config/tailwind/base');

module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
    '../../packages/studio-components/src/**/*.{ts,tsx}',
    '../../packages/creator-ui/src/**/*.{ts,tsx}',
    '../../packages/charts/src/**/*.{ts,tsx}',
    '../../packages/subscription-ui/src/**/*.{ts,tsx}',
    '../../packages/revenue-ui/src/**/*.{ts,tsx}',
    '../../packages/sponsorship-ui/src/**/*.{ts,tsx}',
  ],
};
