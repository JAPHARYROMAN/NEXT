import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,

  // Cross-workspace transpile for shared packages.
  transpilePackages: [
    '@next/ui',
    '@next/design-system',
    '@next/api-client',
    '@next/auth-sdk',
    '@next/feature-flags',
    '@next/logger',
    '@next/telemetry',
    '@next/types',
  ],

  experimental: {
    typedRoutes: true,
    serverActions: { bodySizeLimit: '4mb' },
    optimizePackageImports: ['@next/ui', '@next/design-system', 'framer-motion'],
    ppr: 'incremental',
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.next.io' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
  ],

  async redirects() {
    return [];
  },

  // Outputs a self-contained build for the container image (reduces layer size).
  output: 'standalone',
};

export default config;
