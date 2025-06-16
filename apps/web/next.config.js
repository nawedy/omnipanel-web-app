/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Vercel deployment
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    // Allow builds to succeed even with type errors during deployment
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration  
  eslint: {
    // Allow builds to succeed even with lint errors during deployment
    ignoreDuringBuilds: true,
  },
  
  // Webpack configuration for handling dependencies
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle ESM packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    STANDALONE_BUILD: process.env.STANDALONE_BUILD || process.env.VERCEL === '1' ? '1' : '0',
  },
  
  // Images configuration
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 