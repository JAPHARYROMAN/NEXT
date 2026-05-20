import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@next/ui',
    '@next/design-system',
    '@next/animation-system',
    '@next/theme-system',
    '@next/layout-engine',
    '@next/frontend-utils',
    '@next/icons',
    '@next/auth-sdk',
    '@next/charts',
    '@next/creator-ui',
    '@next/studio-components',
    '@next/media-ui',
  ],
};

export default config;
