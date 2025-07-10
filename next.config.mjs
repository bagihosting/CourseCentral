/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  /**
   * @description Menonaktifkan pemeriksaan tipe TypeScript selama build.
   * Ini sangat berguna dalam alur kerja CI/CD di mana pemeriksaan tipe
   * ditangani dalam langkah terpisah.
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * @description Menonaktifkan ESLint selama build.
   * Serupa dengan TypeScript, ini memungkinkan proses build fokus pada pembuatan
   * artefak, sementara linting ditangani sebagai proses terpisah.
   */
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
              source: "/api/:path*",
              headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  { key: "Access-Control-Allow-Origin", value: "*" },
                  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
                  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
              ]
          }
      ]
  }
};

export default nextConfig;
