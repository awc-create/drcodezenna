/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io' }],
    unoptimized: true,
  },
  eslint: { ignoreDuringBuilds: true },

  // ⬇️ moved out of `experimental`
  outputFileTracingIncludes: {
    // ensure bcryptjs is copied into .next/standalone
    '/**/*': ['./node_modules/bcryptjs/**'],
  },
};

module.exports = nextConfig;
