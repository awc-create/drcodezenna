/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    // If you keep unoptimized, this is ignored; safe to leave in.
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io' }],
    unoptimized: true,
  },
};
module.exports = nextConfig;
