import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@typefolio/core"],
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
