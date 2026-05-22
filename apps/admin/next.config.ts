import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@next/ui', '@next/design-system', '@next/frontend-utils', '@next/auth-sdk'],
};

export default config;
