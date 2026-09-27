import type { NextConfig } from "next";

const blobOrigin = process.env.DESKTOP_BLOB_PUBLIC_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      { source: "/pricing", destination: "/", permanent: true },
      { source: "/downloads", destination: "/?download=1", permanent: false },
    ];
  },
  async rewrites() {
    if (!blobOrigin) {
      return [];
    }
    return [
      {
        source: "/desktop/releases/:path*",
        destination: `${blobOrigin}/desktop/releases/:path*`,
      },
    ];
  },
};

export default nextConfig;
