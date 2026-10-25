import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eigenständige Praxismodul-App (statischer Vite-Build in public/apps/praxismodul)
  async rewrites() {
    return [{ source: "/apps/praxismodul", destination: "/apps/praxismodul/index.html" }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
