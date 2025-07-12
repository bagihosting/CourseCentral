/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  output: 'standalone',
  typescript: {
    // Mencegah error TypeScript menggagalkan build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mencegah error ESLint menggagalkan build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
