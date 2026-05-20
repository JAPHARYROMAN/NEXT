import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@next/ui',
    '@next/design-system',
    '@next/auth-sdk',
    '@next/identity-types',
    '@next/security-utils',
    '@next/session-utils',
  ],
  experimental: {
    typedRoutes: true,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin' },
        // Auth portal runs a hard CSP — it is the most sensitive surface.
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; connect-src 'self' http://localhost:14000; img-src 'self' data:; style-src 'self' 'unsafe-inline'",
        },
      ],
    },
  ],
  ...(process.platform === 'win32' ? {} : { output: 'standalone' as const }),
};

export default config;
