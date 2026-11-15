import type { NextConfig } from "next";

/** The admin page and its APIs: never cached, never indexed. */
const PRIVATE_HEADERS = [
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [
      { source: "/admin", headers: PRIVATE_HEADERS },
      { source: "/api/admin/:path*", headers: PRIVATE_HEADERS },
      { source: "/api/book", headers: PRIVATE_HEADERS },
    ];
  },
  partialPrefetching: true,
  images: {
    // Photos come only from Unsplash's image host, at one fixed source size (lib/photos.ts, UNSPLASH_QUERY).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/photo-*",
        search: "?fm=jpg&q=80&w=2000&fit=max",
      },
    ],
    qualities: [75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
