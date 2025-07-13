const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@messai/core', '@messai/ui'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@messai/core/domain': path.resolve(__dirname, '../../libs/core/domain/src/index.ts'),
      '@messai/ui/components': path.resolve(__dirname, '../../libs/ui/components/src/index.tsx'),
    };
    return config;
  },
}

module.exports = nextConfig