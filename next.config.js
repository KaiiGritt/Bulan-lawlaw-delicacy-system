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
  serverExternalPackages: ['formidable'],
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
};

module.exports = nextConfig;
