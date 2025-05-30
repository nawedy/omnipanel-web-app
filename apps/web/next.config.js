/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: [
    '@omnipanel/types',
    '@omnipanel/config', 
    '@omnipanel/database',
    '@omnipanel/ui',
    '@omnipanel/llm-adapters',
    '@omnipanel/core'
  ],
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { dev, isServer }) => {
    // Handle Monaco Editor
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: 'worker-loader',
        options: {
          name: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      },
    });

    // Handle xterm.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig; 