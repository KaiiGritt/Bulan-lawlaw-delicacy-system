const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3.bp.blogspot.com',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    turbopack: false,
  },
};

module.exports = nextConfig;
