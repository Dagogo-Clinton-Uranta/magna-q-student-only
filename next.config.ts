import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["ws"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
} satisfies NextConfig;

export default nextConfig;
