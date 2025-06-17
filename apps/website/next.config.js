const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-optimized experimental features
  experimental: {
    scrollRestoration: true,
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
  // Optimized image configuration for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.omnipanel.ai',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 31536000,
  },
  // Enable ESLint for production builds on Vercel
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Redirects, headers, and rewrites are now handled in vercel.json
  // for better performance and caching
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