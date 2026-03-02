import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || basePath;
const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tharaday-vercel.vercel.app';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
