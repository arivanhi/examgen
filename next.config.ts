import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wajib: beritahu Next.js agar TIDAK mem-bundle puppeteer lewat webpack.
  // Puppeteer harus jalan sebagai native Node.js module di server.
  serverExternalPackages: ["puppeteer", "puppeteer-core"],
};

export default nextConfig;