import type { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";

export default function robots(): MetadataRoute.Robots {
  return {
    host: appConfig.BASE_URL,
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${appConfig.BASE_URL}/sitemap.xml`,
  };
}
