import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

import appConfig from "@/lib/core/config";

const withNextIntl = createNextIntlPlugin("./src/lib/intl/request.ts");

export const remotePatternFromUrl = () => {
  const url = new URL(appConfig.BASE_URL);

  return {
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/api/media/file/**",
  } as RemotePattern;
};
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: false,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [remotePatternFromUrl()],
  },
  serverExternalPackages: ["sharp"],

  experimental: {
    optimizePackageImports: ["react-icons", "@radix-ui/react-label"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
