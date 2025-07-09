
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
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
  async headers() {
      return [
          {
              // Berlaku untuk semua rute API di bawah /api/
              source: "/api/:path*",
              headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  // KEAMANAN PENTING: Di lingkungan produksi, ganti "*" dengan domain frontend spesifik Anda
                  // untuk mencegah permintaan dari situs web yang tidak sah.
                  // Contoh: { key: "Access-Control-Allow-Origin", value: "https://platformanda.com" },
                  { key: "Access-Control-Allow-Origin", value: "*" },
                  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
                  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
              ]
          }
      ]
  }
};

export default nextConfig;
