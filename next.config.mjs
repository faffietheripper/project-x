/** @type {import('next').NextConfig} */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "pub-24083acae3654ddc922efecd4e517ac9.r2.dev",
        protocol: "https",
        port: "",
      },
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/photo/**",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Fallback for 'net' module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        fs: false,
        tls: false,
        perf_hooks: false,
      };
    }

    return config;
  },
};

export default nextConfig;
