import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The build cache stores env values (including secrets) in .next/cache,
    // which trips Netlify's secrets scan. Builds are fast enough without it.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
