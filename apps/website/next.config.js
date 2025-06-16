const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that might cause issues
  experimental: {
    typedRoutes: false,
  },
  // Enable transpilation of custom packages
  transpilePackages: [
    '@omnipanel/types',
    '@omnipanel/config', 
    '@omnipanel/database',
    '@omnipanel/ui',
    '@omnipanel/llm-adapters',
    '@omnipanel/core',
    '@omnipanel/theme-engine',
    '@omnipanel/plugin-sdk'
  ],
  // Simplify image configuration
  images: {
    domains: [
      'github.com', 
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'cdn.omnipanel.ai'
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
  // Disable ESLint during build to avoid potential issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/omnipanel/omnipanel',
        permanent: false,
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/omnipanel',
        permanent: false,
      },
      {
        source: '/twitter',
        destination: 'https://twitter.com/omnipanel',
        permanent: false,
      },
      {
        source: '/app',
        destination: 'https://app.omnipanel.ai',
        permanent: false,
      },
      {
        source: '/docs',
        destination: 'https://docs.omnipanel.ai',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.omnipanel.ai',
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.omnipanel.ai',
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  trailingSlash: false,
};

module.exports = withBundleAnalyzer(nextConfig); 