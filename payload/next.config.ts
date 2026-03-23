import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

import appConfig from "@/lib/core/config";

const withNextIntl = createNextIntlPlugin("./src/lib/intl/request.ts");

const remotePatternsFromConfig = (): RemotePattern[] => {
  const patterns: RemotePattern[] = [];

  if (appConfig.SERVER_URL) {
    const baseUrl = new URL(appConfig.SERVER_URL);

    patterns.push({
      protocol: baseUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: baseUrl.hostname,
      ...(baseUrl.port ? { port: baseUrl.port } : {}),
      pathname: "/api/media/file/**",
    });
  }

  if (appConfig.BLOB_URL) {
    const blobUrl = new URL(appConfig.BLOB_URL);

    patterns.push({
      protocol: blobUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: blobUrl.hostname,
      ...(blobUrl.port ? { port: blobUrl.port } : {}),
      pathname: "/**",
    });
  }

  return patterns;
};
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: true,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    remotePatterns: remotePatternsFromConfig(),
  },
  serverExternalPackages: ["sharp"],

  experimental: {
    optimizePackageImports: ["react-icons"],
  },

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default withPayload(withNextIntl(nextConfig));
