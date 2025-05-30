const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  images: {
    domains: [
      'github.com', 
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'cdn.omnipanel.ai'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    dirs: ['app', 'components', 'lib'],
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