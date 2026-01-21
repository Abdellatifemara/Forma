/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.formaeg.com', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/app/workouts',
        permanent: false,
      },
      {
        source: '/trainer',
        destination: '/trainer/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
