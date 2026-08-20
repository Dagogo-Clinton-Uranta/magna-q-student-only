import type { NextConfig } from "next";

const blogImageRemotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: "https",
    hostname: "**.amazonaws.com",
    pathname: "/**",
  },
];
const configuredS3Origins: string[] = [];
for (const value of [
  process.env.AWS_S3_PUBLIC_URL,
  process.env.AWS_S3_ENDPOINT,
]) {
  if (!value) continue;
  try {
    const url = new URL(value);
    configuredS3Origins.push(url.origin);
    blogImageRemotePatterns.push({
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    });
  } catch {
    // Environment validation reports malformed URLs at application startup.
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["bullmq", "ioredis", "mongoose", "ws"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      ...blogImageRemotePatterns,
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://i.ytimg.com https://*.amazonaws.com ${configuredS3Origins.join(" ")}; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.amazonaws.com ${configuredS3Origins.join(" ")}; font-src 'self'; media-src 'self' blob:; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
