const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Consider setting to true for dev
  },
  devIndicators: {
    buildActivity: true,
    autoPrerender: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      lib: path.resolve(__dirname, "lib"),
      components: path.resolve(__dirname, "components"),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      mysql: false,
      "pg-native": false,
      sqlite3: false,
      "react-native-sqlite-storage": false,
      "@sap/hana-client": false,
      "@sap/hana-client/extension/Stream": false,
    };

    return config;
  },
};

module.exports = nextConfig;
