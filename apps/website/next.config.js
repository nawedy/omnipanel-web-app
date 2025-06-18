/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-optimized experimental features
  experimental: {
    scrollRestoration: true,
  },
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
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://omnipanel.ai',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.omnipanel.ai',
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.omnipanel.ai',
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  trailingSlash: false,
};

module.exports = nextConfig; 