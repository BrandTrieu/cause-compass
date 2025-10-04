import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/gh/simple-icons/simple-icons@develop/icons/**',
      },
    ],
  },
};

export default nextConfig;
