import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/IDV-DASHBOARD" : "",
  assetPrefix: isProd ? "/IDV-DASHBOARD/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
