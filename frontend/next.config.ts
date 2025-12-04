import bundleAnalyzer from "@next/bundle-analyzer";
import webpack from "webpack";

import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  turbopack: {
    root: __dirname,
  },

  webpack(config, { isServer }) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    );

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        minSize: 10000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
      },
      runtimeChunk: "single",
      moduleIds: "deterministic",
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  headers: async () => [
    // Allow testing from your phone over local LAN (192.168.x.x) in development
    ...(process.env.NODE_ENV === "development"
      ? [
          {
            source: "/:path*",
            headers: [
              {
                key: "Content-Security-Policy",
                value:
                  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; connect-src * blob: data:;",
              },
            ],
          },
        ]
      : []),
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/:path*(\\.css|\\.js)$",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source:
        "/:path*(\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp|\\.avif|\\.ico|\\.svg|\\.woff2?)$",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default withBundleAnalyzer(config);
