/** @type {import('next').NextConfig} */
const backendUrl =
  process.env['BACKEND_URL-PROD'] ||
  process.env.BACKEND_URL ||
  'http://localhost:5000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;