const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3.bp.blogspot.com',
      },
    ],
  },
  // Removed deprecated turbopack config to fix build warning
  experimental: {
  },
};

module.exports = nextConfig;
