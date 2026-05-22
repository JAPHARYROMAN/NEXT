const preset = require('@next/config/tailwind/base');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/web/**/*.{ts,tsx}',
    '../../packages/layout-engine/src/**/*.{ts,tsx}',
    '../../packages/tv-ui/src/**/*.{ts,tsx}',
    '../../packages/theater-ui/src/**/*.{ts,tsx}',
    '../../packages/remote-navigation/src/**/*.{ts,tsx}',
    '../../packages/discovery-ui/src/**/*.{ts,tsx}',
    '../../packages/community-ui/src/**/*.{ts,tsx}',
    '../../packages/player-ui/src/**/*.{ts,tsx}',
    '../../packages/spatial-ui/src/**/*.{ts,tsx}',
    '../../packages/immersive-ui/src/**/*.{ts,tsx}',
    '../../packages/environment-ui/src/**/*.{ts,tsx}',
    '../../packages/ambient-motion/src/**/*.{ts,tsx}',
    '../../packages/entitlement-ui/src/**/*.{ts,tsx}',
    '../../packages/subscription-ui/src/**/*.{ts,tsx}',
    '../../packages/monetization-ui/src/**/*.{ts,tsx}',
    '../../packages/commerce-ui/src/**/*.{ts,tsx}',
    '../../packages/sponsorship-ui/src/**/*.{ts,tsx}',
    '../../packages/revenue-ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        tv: '1280px',
        projector: '2560px',
      },
      fontSize: {
        display: ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        body: ['1rem', { lineHeight: '1.55' }],
      },
    },
  },
};
