const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3.bp.blogspot.com',
      },
      {
        protocol: 'https',
        hostname: 'share.google',
      },
    ],
  },
  // Removed experimental key to fix turbopack build issue
};

module.exports = nextConfig;
