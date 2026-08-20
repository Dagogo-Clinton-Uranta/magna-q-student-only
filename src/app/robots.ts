import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/privacy",
          "/terms",
          "/contact",
          "/medical-disclaimer",
        ],
        disallow: [
          "/dashboard",
          "/study",
          "/onboarding",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
