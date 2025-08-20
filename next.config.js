/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io' }],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      // Ensure bcryptjs gets copied into .next/standalone/node_modules
      '/**/*': ['./node_modules/bcryptjs/**'],
    },
  },
};
module.exports = nextConfig;
